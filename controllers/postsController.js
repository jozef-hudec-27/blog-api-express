const Post = require('../models/post')
const { validationResult } = require('express-validator')
const { protectRoute } = require('../middleware/authMiddleware')
const asyncHandler = require('express-async-handler')
const { postValidations } = require('./validations')
const { postExists, postPermissions } = require('../middleware/postMiddleware')

exports.index = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate('author', 'firstName lastName')

  res.status(200).json(posts)
})

exports.show = [
  postExists,

  asyncHandler(async (req, res, next) => {
    const post = req.post
    await post.populate('author', 'firstName lastName')

    res.status(200).json(post)
  }),
]

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

  postPermissions,

  postValidations,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const post = await Post.findByIdAndUpdate(req.post._id, { ...req.body, updatedAt: Date.now() }, { new: true })

    res.status(200).json(post)
  }),
]

exports.delete = [
  protectRoute(true),

  postPermissions,

  asyncHandler(async (req, res, next) => {
    await Post.findByIdAndDelete(req.post._id)

    res.status(204).end()
  }),
]
