const { getDb } = require('../../../shared/mongoClient');
const prisma = require('../../../shared/prismaClient');

/**
 * driverMatching.js
 * Handles matching logic using Redis GEO commands
 */

exports.findAndNotifyDrivers = async (ride, pickupLat, pickupLng, vehicleType) => {
  try {
    const rideId = ride.id;
    // 1. Fetch nearby drivers within 500m radius via MongoDB (as requested)
    const db = await getDb();
    const nearbyDriversRaw = await db.collection('drivers_locations').find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(pickupLng), parseFloat(pickupLat)]
          },
          $maxDistance: 500
        }
      }
    }).limit(20).toArray();

    const nearbyDrivers = nearbyDriversRaw.map(d => [d.driverId, 0]); 

    if (!nearbyDrivers || nearbyDrivers.length === 0) {
      console.log(`No drivers found for ride ${rideId} within 500m`);
      return;
    }

    const driverIds = nearbyDrivers.map(d => d[0]);
    
    // 2. Rank drivers
    const availableDrivers = await prisma.driver.findMany({
      where: {
        id: { in: driverIds },
        status: 'online',
        ...(vehicleType && { vehicleType })
      },
      select: { id: true, rating: true, vehicleType: true }
    });

    if (availableDrivers.length === 0) {
      console.log(`No available drivers matching criteria for ride ${rideId}`);
      return;
    }

    const rankedDrivers = availableDrivers.map(dbDriver => {
      const geoData = nearbyDrivers.find(d => d[0] === dbDriver.id);
      const distance = parseFloat(geoData[1]);
      const score = distance - (dbDriver.rating * 0.5); 
      return { ...dbDriver, distance, score };
    }).sort((a, b) => a.score - b.score).slice(0, 10); // Notify up to 10 nearby drivers

    // 3. Store matched drivers
    await db.collection('pending_matches').updateOne(
      { rideId },
      { $set: { driverIds: rankedDrivers.map(d => d.id), createdAt: new Date() } },
      { upsert: true }
    );

    // 4. Broadcast to drivers
    await this.notifyDriversViaTrackingService(rankedDrivers.map(d => d.id), ride);

  } catch (error) {
    console.error('Error in driver matching:', error);
  }
};

exports.getNearbyDrivers = async (lat, lng, vehicleType, radius = 500) => {
  try {
    const db = await getDb();
    const nearbyDriversRaw = await db.collection('drivers_locations').find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: radius
        }
      }
    }).limit(10).toArray();

    if (nearbyDriversRaw.length === 0) return [];

    const driverIds = nearbyDriversRaw.map(d => d.driverId);
    
    const drivers = await prisma.driver.findMany({
      where: {
        id: { in: driverIds },
        status: 'online',
        ...(vehicleType && { vehicleType })
      },
      select: { 
        id: true, 
        name: true, 
        rating: true, 
        vehicleType: true,
        vehicleModel: true,
        vehiclePlate: true,
        latitude: true,
        longitude: true
      }
    });

    // Add distance to each driver object
    const driversWithDistance = drivers.map(driver => {
      const geoInfo = nearbyDriversRaw.find(d => d.driverId === driver.id);
      
      const targetLat = parseFloat(lat);
      const targetLng = parseFloat(lng);
      const driverLat = geoInfo ? geoInfo.location.coordinates[1] : null;
      const driverLng = geoInfo ? geoInfo.location.coordinates[0] : null;

      return {
        ...driver,
        distance: (geoInfo && !isNaN(targetLat) && !isNaN(targetLng)) 
          ? calculateDistance(targetLat, targetLng, driverLat, driverLng) 
          : null
      };
    });

    return driversWithDistance;
  } catch (error) {
    console.error('Error fetching nearby drivers:', error);
    throw error;
  }
};

// Helper to calculate distance in meters
function calculateDistance(lat1, lon1, lat2, lon2) {
  const p1 = parseFloat(lat1);
  const p2 = parseFloat(lon1);
  const p3 = parseFloat(lat2);
  const p4 = parseFloat(lon2);

  if (isNaN(p1) || isNaN(p2) || isNaN(p3) || isNaN(p4)) return null;

  const R = 6371e3; // metres
  const φ1 = p1 * Math.PI/180;
  const φ2 = p3 * Math.PI/180;
  const Δφ = (p3 - p1) * Math.PI/180;
  const Δλ = (p4 - p2) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

exports.notifyDriversViaTrackingService = async (driverIds, ride) => {
  try {
    const message = {
      event: 'ride_request',
      driverIds,
      rideId: ride.id,
      userName: ride.userName,
      fare: ride.fare,
      pickup: {
        address: ride.pickupAddress,
        lat: ride.pickupLat,
        lng: ride.pickupLng
      },
      drop: {
        address: ride.dropAddress,
        lat: ride.dropLat,
        lng: ride.dropLng
      },
      createdAt: new Date()
    };
    
    const db = await getDb();
    await db.collection('driver_notifications').insertOne(message);
    
    // Set a timeout
    setTimeout(async () => {
      const currentRide = await prisma.ride.findUnique({ where: { id: ride.id } });
      if (currentRide && currentRide.status === 'searching') {
        console.log(`Ride ${ride.id} request timed out.`);
      }
    }, 15000);

  } catch (error) {
    console.error('Failed to notify drivers:', error);
  }
};
