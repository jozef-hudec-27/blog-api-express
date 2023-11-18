const { body, validationResult } = require('express-validator')
const { protectRoute } = require('../utils/auth')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')

exports.enableAuthor = [
  protectRoute(),

  body('code', 'Incorrect code.').trim().equals(process.env.AUTHOR_CODE),

  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized.' })
    } else if (req.user.isAuthor) {
      return res.status(204).end()
    }

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    await User.findByIdAndUpdate(req.user._id, { isAuthor: true })

    res.status(200).json({ message: 'You are now an author.' })
  }),
]
