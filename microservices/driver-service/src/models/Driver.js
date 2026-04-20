const mongoose = require('mongoose');

const DriverSchema = new mongoose.Schema({
  authId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  name: { type: String, required: [true, 'Please add a name'], trim: true },
  phone: { type: String, required: [true, 'Please add a phone number'], unique: true },
  email: { type: String, trim: true },
  profilePhoto: { type: String },

  license: {
    number: { type: String, unique: true },
    expiryDate: { type: Date },
    type: { type: String, enum: ['LMV', 'COMMERCIAL', '2W'], default: 'LMV' },
    frontImage: { type: String },
    backImage: { type: String }
  },

  governmentId: {
    type: { type: String, enum: ['AADHAAR', 'PAN', 'OTHER'], default: 'AADHAAR' },
    number: { type: String },
    frontImage: { type: String },
    backImage: { type: String }
  },

  vehicleDetails: {
    type: { type: String, enum: ['bike', 'auto', 'car', 'suv'] },
    model: { type: String },
    plateNumber: { type: String },
    color: { type: String },
    year: { type: Number },
    vehiclePhoto: { type: String }
  },

  paymentDetails: {
    bankAccountNumber: String,
    ifscCode: String,
    accountHolderName: String,
    upiId: String
  },

  locationDefaults: {
    city: String,
    preferredArea: String,
    availability: String
  },

  backgroundInfo: {
    selfDeclaration: { type: Boolean, default: false },
    emergencyContact: String
  },

  verificationStatus: {
    type: String,
    enum: ['REGISTERED', 'DOCUMENTS_UPLOADED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'],
    default: 'REGISTERED'
  },
  
  rejectionReason: { type: String },

  status: {
    type: String,
    enum: ['offline', 'online', 'active', 'busy'],
    default: 'offline'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], index: '2dsphere' }
  },
  rating: { type: Number, default: 5.0 },
  
  systemData: {
    deviceId: String,
    ipLogs: [String],
    signupTimestamp: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', DriverSchema);
