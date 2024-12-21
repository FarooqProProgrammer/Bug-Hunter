import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User.js';

export default function configurePassport(passport) {
  // Local Strategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await User.findOne({ username }).select('+password'); // Explicitly include the password field
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }

        const isMatch = await user.matchPassword(password); // Assuming `matchPassword` is a custom method in the User schema
        if (!isMatch) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // Remove the password before returning
        user.password = undefined;

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  // Serialize user (include only the fields you need in the session store)
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, username: user.username });
  });

  // Deserialize user (fetch the complete user object without the password)
  passport.deserializeUser(async (data, done) => {
    try {
      const user = await User.findById(data.id).select('-password'); // Exclude the password field
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}
