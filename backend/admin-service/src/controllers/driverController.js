const driverService = require('../services/driverService');
const { driverApprovalSchema } = require('../validations');

const getDrivers = async (req, res, next) => {
  try {
    const drivers = await driverService.getAllDrivers();
    res.json({ success: true, data: drivers });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { driverId, status, rejectionReason } = driverApprovalSchema.parse(req.body);
    const driver = await driverService.updateDriverStatus(driverId, status, rejectionReason);
    res.json({ success: true, data: driver });
  } catch (error) {
    next(error);
  }
};

const toggleActive = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const user = await driverService.toggleDriverActive(id, isActive);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDrivers,
  updateStatus,
  toggleActive,
};
