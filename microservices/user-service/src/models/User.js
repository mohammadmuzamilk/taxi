const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    unique: true,
    trim: true,
    // E.164 Validation (e.g., +919876543210)
    match: [
      /^\+?[1-9]\d{1,14}$/,
      'Please add a valid E.164 phone number'
    ]
  },
  otp: {
    type: String,
    select: false // Don't return OTP by default in queries
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // Automatically creates createdAt and updatedAt fields
});

// Index for performance on searches by phone
UserSchema.index({ phone: 1 });

module.exports = mongoose.model('User', UserSchema);
