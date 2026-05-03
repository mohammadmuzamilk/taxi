// prisma/seed.js — run with: node prisma/seed.js  (from backend/ root)
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../client-service/.env') });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── 1. Admin user ──────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { phone: '+919999900000' },
    update: {},
    create: {
      phone: '+919999900000',
      name:  'Super Admin',
      email: 'admin@chardhogo.com',
      role:  'admin',
    },
  });
  console.log('✅ Admin user:', admin.id);

  // ── 2. Sample user ──────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { phone: '+919876543210' },
    update: {},
    create: {
      phone: '+919876543210',
      name:  'Rahul Sharma',
      email: 'rahul@example.com',
      role:  'user',
    },
  });
  console.log('✅ Sample user:', user.id);

  // ── 3. Sample driver user ──────────────────────────────────────────────────
  const driverUser = await prisma.user.upsert({
    where: { phone: '+917777788888' },
    update: {},
    create: {
      phone: '+917777788888',
      name:  'Rajesh Kumar',
      email: 'rajesh@example.com',
      role:  'driver',
    },
  });

  // ── 4. Driver profile ──────────────────────────────────────────────────────
  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId:            driverUser.id,
      name:              'Rajesh Kumar',
      phone:             '+917777788888',
      email:             'rajesh@example.com',
      licenseNumber:     'DL-1234567890',
      licenseType:       'LMV',
      vehicleType:       'CAR',
      vehicleModel:      'Maruti Swift',
      vehiclePlate:      'DL01AB1234',
      vehicleColor:      'White',
      vehicleYear:       2020,
      verificationStatus:'APPROVED',
      status:            'offline',
      rating:            4.8,
      latitude:          28.6139,
      longitude:         77.2090,
    },
  });
  console.log('✅ Driver profile:', driver.id);

  // ── 5. Sample completed ride ───────────────────────────────────────────────
  const ride = await prisma.ride.create({
    data: {
      userId:        user.id,
      userName:      user.name,
      userPhone:     user.phone,
      driverId:      driver.id,
      driverName:    driver.name,
      driverPhone:   driver.phone,
      driverVehicle: `${driver.vehicleModel} (${driver.vehiclePlate})`,
      pickupAddress: 'Connaught Place, New Delhi',
      pickupLat:     28.6315,
      pickupLng:     77.2167,
      dropAddress:   'India Gate, New Delhi',
      dropLat:       28.6129,
      dropLng:       77.2295,
      fare:          120.00,
      distance:      '4.2 km',
      duration:      '18 min',
      status:        'completed',
    },
  });
  console.log('✅ Sample ride:', ride.id);

  // ── 6. Payment for that ride ───────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      rideId:        ride.id,
      amount:        120.00,
      status:        'SUCCESS',
      paymentMethod: 'UPI',
    },
  });
  console.log('✅ Payment created for ride');

  console.log('\n🎉 Seeding complete!\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
