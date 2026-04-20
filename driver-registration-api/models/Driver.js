const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  profilePhoto: {
    type: String,
    required: [true, 'Profile photo URL is required']
  },
  license: {
    number: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    frontImage: { type: String, required: true },
    backImage: { type: String, required: true }
  },
  vehicle: {
    model: { type: String, required: true },
    plateNumber: { type: String, required: true },
    color: { type: String, required: true },
    type: { type: String, enum: ['Bike', 'Auto', 'Car', 'SUV'], required: true }
  },
  documents: {
    aadhaarCard: { type: String, required: true },
    panCard: { type: String, required: true },
    registrationCertificate: { type: String, required: true }
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
