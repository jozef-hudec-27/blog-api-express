const Post = require('../models/post')
const { validationResult } = require('express-validator')
const { protectRoute } = require('../utils/auth')
const asyncHandler = require('express-async-handler')
const { postValidations } = require('./validations')

const postExists = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' })
  }

  req.post = post
  next()
})

// Succeeds if post exists and user is admin or author of post
const postPermissions = [
  // Check if post exists
  postExists,

  // Check if user is admin or author of post
  (req, res, next) => {
    if (!req.user.isAdmin && req.post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    next()
  },
]

exports.index = asyncHandler(async (req, res, next) => {
  const posts = await Post.find().populate('author', 'firstName lastName')

  res.status(200).json(posts)
})

exports.show = [
  postExists,

  asyncHandler(async (req, res, next) => {
    const post = req.post
    await post.populate('author', 'firstName lastName')

    res.status(200).json(req.post)
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
