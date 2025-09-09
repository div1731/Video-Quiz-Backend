const { ExtractJwt, Strategy: JwtStrategy } = require("passport-jwt");
const { EXPRESS_SECRET } = require("../config/env");
const User = require("../models/auth.model");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: EXPRESS_SECRET,
};

// Validate secretOrKey
if (!opts.secretOrKey) {
  throw new Error("EXPRESS_SECRET is not defined. Please set it in your environment variables.");
}

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(opts, async (jwtPayload, done) => {
      try {
        const user = await User.findById(jwtPayload.id);
        if (!user) {
          return done(null, false);
        }
        return done(null, user);
      } catch (e) {
        console.error("Error in JwtStrategy:", e.message);
        return done(null, false);
      }
    })
  );
};