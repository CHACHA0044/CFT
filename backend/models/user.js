const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },   // verification flag
  verificationToken: { type: String },             // verification JWT
  createdAt: { type: Date, default: Date.now, expires: 86400 } // auto-delete after 24h
}, { timestamps: true });

// Only delete if not verified
userSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { isVerified: false } });

module.exports = mongoose.model('User', userSchema);
