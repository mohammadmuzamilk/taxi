const prisma = require('../prisma');

const getRevenueStats = async () => {
  const totalRevenue = await prisma.payment.aggregate({
    where: { status: 'SUCCESS' },
    _sum: { amount: true },
  });

  const driverEarnings = await prisma.driverEarning.aggregate({
    _sum: { netAmount: true },
  });

  return {
    totalRevenue: totalRevenue._sum.amount || 0,
    driverEarnings: driverEarnings._sum.netAmount || 0,
    platformCommission: (totalRevenue._sum.amount || 0) - (driverEarnings._sum.netAmount || 0),
  };
};

const getRecentPayments = async () => {
  return await prisma.payment.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      ride: true,
    },
  });
};

module.exports = {
  getRevenueStats,
  getRecentPayments,
};
