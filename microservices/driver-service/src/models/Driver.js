const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  authId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid E.164 phone number']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add a license number'],
    unique: true
  },
  vehicleDetails: {
    model: String,
    plateNumber: String,
    color: String,
    type: {
      type: String,
      enum: ['sedan', 'suv', 'bike'],
      default: 'sedan'
    }
  },
  status: {
    type: String,
    enum: ['offline', 'online', 'active', 'busy'],
    default: 'offline'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere' // Geospatial index for nearby driver searches
    }
  },
  rating: {
    type: Number,
    default: 5.0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);
