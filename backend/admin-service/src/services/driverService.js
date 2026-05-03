const prisma = require('../prisma');

const getAllDrivers = async () => {
  return await prisma.driver.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const updateDriverStatus = async (driverId, status, rejectionReason = null) => {
  return await prisma.driver.update({
    where: { id: driverId },
    data: {
      verificationStatus: status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
    },
  });
};

const toggleDriverActive = async (driverId, isActive) => {
  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
    select: { userId: true },
  });

  return await prisma.user.update({
    where: { id: driver.userId },
    data: { isActive },
  });
};

module.exports = {
  getAllDrivers,
  updateDriverStatus,
  toggleDriverActive,
};
