const User = require('../models/user')
const { body, validationResult } = require('express-validator')
const asyncHandler = require('express-async-handler')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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

  const passwordMatch = await bcrypt.compare(req.body.password, user.passwordEncrypted)

  if (!passwordMatch) {
    return res.status(400).json({ message: 'Invalid email or password.' })
  }

  const token = jwt.sign({ user }, process.env.JWT_SECRET)

  res.json({ token })
})
