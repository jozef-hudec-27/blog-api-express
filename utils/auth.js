const jwt = require('jsonwebtoken')
const passport = require('passport')

const checkTokenExpiration = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized.' })
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err && err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    } else if (err) {
      return res.status(401).json({ message: 'Invalid token' })
    }

    next()
  })
}

const requireAuthor = (req, res, next) => {
  req._requireAuthor = true

  next()
}

exports.protectRoute = (authorRequired = false) => {
  const middleware = []

  middleware.push(checkTokenExpiration)

  if (authorRequired) {
    middleware.push(requireAuthor)
  }

  middleware.push(passport.authenticate('jwt', { session: false }))

  return middleware
}
