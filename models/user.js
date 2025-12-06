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
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  passwordToken: {type: String },
  passwordTokenCreatedAt: { type: Date },
  tempPassword: { type: String },
  tempPasswordCreatedAt: { type: Date },
  
  // NEW PROFILE FIELDS
  profilePicture: { 
    type: String, 
    default: null 
  },
  bio: { 
    type: String, 
    maxlength: 500,
    default: '' 
  },
  profileLastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Indexes
userSchema.index({ lastResendAt: 1 }, { 
  expireAfterSeconds: 600, 
  partialFilterExpression: { isVerified: false } 
});
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);