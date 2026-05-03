const paymentService = require('../services/paymentService');

const getStats = async (req, res, next) => {
  try {
    const stats = await paymentService.getRevenueStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

const getRecent = async (req, res, next) => {
  try {
    const payments = await paymentService.getRecentPayments();
    res.json({ success: true, data: payments });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getRecent,
};
