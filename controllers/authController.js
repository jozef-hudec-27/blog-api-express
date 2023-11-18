const User = require('../models/user')
const { body, validationResult } = require('express-validator')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const REFRESH_TOKEN_COOKIE_OPTIONS = { httpOnly: true, maxAge: 604800000, secure: true, sameSite: 'none' }

exports.register = [
  body('email')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Email must be between 1 and 100 characters.')
    .isEmail()
    .withMessage('Email must be a valid email address.')
    .custom(async (value) => {
      const user = await User.findOne({ email: value })

      if (user) throw new Error('User with that email already exists.')
    })
    .escape(),
  body('firstName', 'First name must be between 1 and 100 characters.').trim().isLength({ min: 1, max: 100 }).escape(),
  body('lastName', 'Last name must be between 1 and 100 characters.').trim().isLength({ min: 1, max: 100 }).escape(),
  body('password', 'Password must be between 6 and 64 characters!').trim().isLength({ min: 6, max: 64 }),
  body('passwordConfirmation').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match.')

    return true
  }),

  async (req, res, next) => {
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) return next(err)

      const errors = validationResult(req)

      try {
        const user = new User({
          email: req.body.email,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          passwordEncrypted: hashedPassword,
        })

        if (!errors.isEmpty()) {
          return res.status(422).json({ errors: errors.array() })
        }

        await user.save()
        res.status(201).json(user)
      } catch (err) {
        next(err)
      }
    })
  },
]

exports.login = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email })

  if (!user) {
    return res.status(400).json({ message: 'Invalid email or password.' })
  }

  const { passwordEncrypted, firstName, lastName, email, _id } = user

  const passwordMatch = await bcrypt.compare(req.body.password, passwordEncrypted)

  if (!passwordMatch) {
    return res.status(400).json({ message: 'Invalid email or password.' })
  }

  // Access token expires in 20 minutes
  const accessToken = jwt.sign({ user: { firstName, lastName, email, _id } }, process.env.JWT_SECRET, {
    expiresIn: 1200,
  })
  const refreshToken = jwt.sign({ user: { _id } }, process.env.JWT_SECRET, { expiresIn: '7d' })

  await User.findByIdAndUpdate(_id, { $push: { tokens: refreshToken } })

  res.cookie('refreshToken', refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS)

  res.json({ accessToken })
})

exports.refresh = [
  // Check if valid refresh token is in DB
  asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      return res.status(401).json({ message: 'Missing token.' })
    }

    const isInDB = await User.findOne({ tokens: refreshToken })

    if (!isInDB) {
      return res.status(401).json({ message: 'Invalid token.' })
    }

    next()
  }),

  // Check token expiration
  asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET, { ignoreExpiration: true })

    // Refresh token has expired
    if (decoded.exp < Date.now() / 1000) {
      await User.findOneAndUpdate({ tokens: refreshToken }, { $pull: { tokens: refreshToken } })

      res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS)

      res.status(403).json({ message: 'Expired token.' })
    }

    // Refresh token has not expired yet
    next()
  }),

  // Issue new access token
  asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET)

      const user = await User.findById(decoded.user._id)

      if (!user) {
        return res.status(404).json({ message: 'User not found.' })
      }

      const { firstName, lastName, email, _id } = user
      const accessToken = jwt.sign({ user: { firstName, lastName, email, _id } }, process.env.JWT_SECRET, {
        expiresIn: 1200,
      })

      res.json({ accessToken })
    } catch (err) {
      res.status(403).json({ message: 'Invalid token.' })
    }
  }),
]

exports.logout = asyncHandler(async (req, res, next) => {
  const refreshToken = req.cookies?.refreshToken

  if (!refreshToken) {
    return res.status(204).end()
  }

  const user = await User.findOneAndUpdate({ tokens: refreshToken }, { $pull: { tokens: refreshToken }, new: true })

  res.clearCookie('refreshToken', REFRESH_TOKEN_COOKIE_OPTIONS)

  if (!user) {
    return res.status(204).end()
  }

  res.status(204).end()
})
