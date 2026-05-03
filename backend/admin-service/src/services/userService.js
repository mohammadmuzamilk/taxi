const prisma = require('../prisma');

const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: { role: 'user' },
    include: {
      userProfile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

const toggleUserActive = async (userId, isActive) => {
  return await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
};

module.exports = {
  getAllUsers,
  toggleUserActive,
};
