const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  full_name: String,
  birth_date: Date,
  gender: String,
  role: { type: String, enum: ['member', 'coach', 'admin'] },
  created_at: { type: Date, default: Date.now },
  emailVerificationToken: String,
  isEmailVerified: { type: Boolean, default: false },
  resetPasswordToken: String,
  resetPasswordExpire: Date
});

const User = mongoose.model('User', userSchema);
module.exports = User;