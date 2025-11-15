const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  provider: { type: String, enum: ['local', 'google'], default: 'local'},
  welcomeEmailSent: { type: Boolean, default: false },
  feedbackGiven: { type: Boolean, default: false },
  passwordHash: { type: String, required: true },
  resendAttempts: { type: Number, default: 0 },
  lastResendAt: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },   // verification flag
  verificationToken: { type: String },             // verification JWT
  passwordToken: {type: String },  // Add this field
  passwordTokenCreatedAt: { type: Date },
  tempPassword: { type: String },
  tempPasswordCreatedAt: { type: Date },
}, { timestamps: true });

// delete if not verified ~10 min(for local users)
userSchema.index({ lastResendAt: 1 }, { expireAfterSeconds: 600, partialFilterExpression: { isVerified: false } });
userSchema.index({ email: 1 }, { unique: true });
module.exports = mongoose.model('User', userSchema);