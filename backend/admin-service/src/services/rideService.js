const prisma = require('../prisma');

const getAllRides = async () => {
  return await prisma.ride.findMany({
    include: {
      client: true,
      driver: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const assignDriverToRide = async (rideId, driverId) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  return await prisma.ride.update({
    where: { id: rideId },
    data: {
      driverId,
      driverName: driver.name,
      driverPhone: driver.phone,
      status: 'accepted',
    },
  });
};

const cancelRide = async (rideId, reason) => {
  return await prisma.ride.update({
    where: { id: rideId },
    data: {
      status: 'cancelled',
      cancelReason: reason,
    },
  });
};

module.exports = {
  getAllRides,
  assignDriverToRide,
  cancelRide,
};
