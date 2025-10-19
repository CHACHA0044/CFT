const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.NODE_ENV === 'production'
    ? 'https://cft-cj43.onrender.com/api/auth/google/callback'
    : 'http://localhost:4950/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    let user = await User.findOne({ email });
    
    if (!user) {
      //dummy password hash
       const namePart = profile.displayName
            ? profile.displayName.split(' ')[0].slice(0, 3).toLowerCase()
            : 'usr';
          const emailPart = email.split('@')[0].slice(0, 3).toLowerCase();
          const randomPart = crypto.randomBytes(3).toString('hex'); // random string

          // final password example: "pra-ema-a1f2c3"
      const mixPass = `${namePart}-${emailPart}-${randomPart}`;
      
      // const dummyPassword = '777777777';
      const passwordHash = await bcrypt.hash(mixPass, 12);
      
      user = new User({
        name: profile.displayName,
        email,
        isVerified: true, // Google emails are verified
        passwordHash, // hashed dummy password
        tempPassword: mixPass,
        provider: 'google'
      });
      await user.save();
      user.tempPasswordCreatedAt = new Date();
      console.log(`✅ New Google user created: ${email}`);
    } else {
      console.log(`✅ Existing Google user logged in: ${email}`);
    }
    
    done(null, user);
  } catch (err) {
    console.error('❌ Google OAuth error:', err);
    done(err, null);
  }
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;