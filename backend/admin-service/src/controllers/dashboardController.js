const dashboardService = require('../services/dashboardService');

const getSummary = async (req, res, next) => {
  try {
    const stats = await dashboardService.getKPISummary();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
};
