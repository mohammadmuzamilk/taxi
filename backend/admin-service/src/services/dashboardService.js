const prisma = require('../prisma');

const getKPISummary = async () => {
  const [userCount, driverCount, totalRides, activeRides] = await Promise.all([
    prisma.user.count({ where: { role: 'client' } }),
    prisma.driver.count(),
    prisma.ride.count(),
    prisma.ride.count({ where: { status: { in: ['searching', 'accepted', 'arrived', 'ongoing'] } } }),
  ]);

  const revenue = await prisma.payment.aggregate({
    where: { status: 'SUCCESS' },
    _sum: { amount: true },
  });

  return {
    totalUsers: userCount,
    totalDrivers: driverCount,
    totalRides,
    activeRides,
    totalRevenue: revenue._sum.amount || 0,
  };
};

module.exports = {
  getKPISummary,
};
