const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  resendAttempts: { type: Number, default: 0 },
  lastResendAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },   // verification flag
  verificationToken: { type: String },             // verification JWT
}, { timestamps: true });

// delete if not verified ~10 min
userSchema.index({ lastResendAt: 1 }, { expireAfterSeconds: 600, partialFilterExpression: { isVerified: false } });
userSchema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);