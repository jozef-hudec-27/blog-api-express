const Post = require('../models/post')
const { body, validationResult } = require('express-validator')
const { protectRoute } = require('../utils/auth')
const asyncHandler = require('express-async-handler')

exports.create = [
  protectRoute(true),

  body('title', 'Post must have a title between 1 and 200 characters.').trim().isLength({ min: 1, max: 200 }).escape(),

  body('body', 'Post must have a body.').trim().isLength({ min: 1 }).escape(),

  body('isPublished').optional({ values: 'falsy' }).isBoolean(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const post = new Post({ ...req.body, author: req.user._id })
    await post.save()

    res.status(201).json(post)
  }),
]
