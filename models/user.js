const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  welcomeEmailSent: { type: Boolean, default: false },
  feedbackGiven: { type: Boolean, default: false },
  passwordHash: { type: String },
  resendAttempts: { type: Number, default: 0 },
  lastResendAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
}, { timestamps: true });

userSchema.index(
  { lastResendAt: 1 },
  { expireAfterSeconds: 600, partialFilterExpression: { isVerified: false } }
);

userSchema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);