const User = require('./models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt

const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true,
}

module.exports = (passport) => {
  passport.use(
    new JwtStrategy(options, async (req, payload, done) => {
      try {
        const user = await User.findById(payload.user?._id)

        if (user) {
          if (req._requireAuthor && !user.isAuthor && !user.isAdmin) {
            return done(null, false, 'Forbidden')
          }

          return done(null, user)
        }

        return done(null, false)
      } catch (err) {
        return done(err, false)
      }
    })
  )
}
