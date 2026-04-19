const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: {
    id: String,
    name: String,
    phone: String
  },
  driver: {
    id: String,
    name: String,
    phone: String,
    vehicle: String,
    location: {
      lat: Number,
      lng: Number
    }
  },
  pickup: {
    address: String,
    lat: Number,
    lng: Number
  },
  drop: {
    address: String,
    lat: Number,
    lng: Number
  },
  status: {
    type: String,
    enum: ['searching', 'accepted', 'arrived', 'ongoing', 'completed', 'cancelled'],
    default: 'searching'
  },
  fare: Number,
  distance: String,
  duration: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ride', rideSchema);
