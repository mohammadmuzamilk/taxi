const Ride = require('../models/Ride');

exports.requestRide = async (req, res) => {
  try {
    const { user, pickup, drop, fare, distance, duration } = req.body;
    
    const ride = await Ride.create({
      user,
      pickup,
      drop,
      fare,
      distance,
      duration,
      status: 'searching'
    });

    res.status(201).json({ success: true, data: ride });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, error: 'Ride not found' });
    res.status(200).json({ success: true, data: ride });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, driver } = req.body;
    const updateData = { status };
    if (driver) updateData.driver = driver;

    const ride = await Ride.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json({ success: true, data: ride });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
