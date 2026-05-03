const rideService = require('../services/rideService');
const { rideAssignSchema } = require('../validations');

const getRides = async (req, res, next) => {
  try {
    const rides = await rideService.getAllRides();
    res.json({ success: true, data: rides });
  } catch (error) {
    next(error);
  }
};

const assignDriver = async (req, res, next) => {
  try {
    const { rideId, driverId } = rideAssignSchema.parse(req.body);
    const ride = await rideService.assignDriverToRide(rideId, driverId);
    res.json({ success: true, data: ride });
  } catch (error) {
    next(error);
  }
};

const cancelRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const ride = await rideService.cancelRide(id, reason);
    res.json({ success: true, data: ride });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRides,
  assignDriver,
  cancelRide,
};
