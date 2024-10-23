const mongoose = require('mongoose');

const unverifiedAdminSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  mobileNumber: String,
  password: String,
  otp: { type: String },
  otpExpiry: Date,
});

module.exports = mongoose.model('UnverifiedAdmin', unverifiedAdminSchema);
