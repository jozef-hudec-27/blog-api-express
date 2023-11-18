const Post = require('../models/post')
const { validationResult } = require('express-validator')
const { protectRoute } = require('../utils/auth')
const asyncHandler = require('express-async-handler')
const { postValidations } = require('./validations')

exports.create = [
  protectRoute(true),

  postValidations,

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

exports.update = [
  protectRoute(true),

  postValidations,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    let post = await Post.findById(req.params.id)

    if (!post) {
      return res.status(404).json({ message: 'Post not found.' })
    } else if (!req.user.isAdmin && post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    post = await Post.findByIdAndUpdate(post._id, { ...req.body, updatedAt: Date.now() }, { new: true })

    res.status(200).json(post)
  }),
]
