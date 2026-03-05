const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User.model');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth 2.0 Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['profile', 'email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // Update last login
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          user.avatar = user.avatar || profile.photos[0]?.value;
          user.isEmailVerified = true;
          user.lastLogin = new Date();
          await user.save();
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          firstName: profile.name?.givenName || profile.displayName.split(' ')[0],
          lastName: profile.name?.familyName || profile.displayName.split(' ').slice(1).join(' '),
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
          authProvider: 'google',
          lastLogin: new Date()
        });

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
