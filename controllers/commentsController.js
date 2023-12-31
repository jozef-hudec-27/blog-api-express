const { postExists } = require('../middleware/postMiddleware')
const { commentExists, commentPermissions } = require('../middleware/commentMiddleware')
const { protectRoute } = require('../middleware/authMiddleware')
const asyncHandler = require('express-async-handler')
const Comment = require('../models/comment')
const { commentValidations } = require('../controllers/validations')
const { validationResult } = require('express-validator')

exports.index = [
  postExists,

  asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({ post: req.post._id }).populate('author', 'firstName lastName')

    res.status(200).json(comments)
  }),
]

exports.show = [
  commentExists,

  asyncHandler(async (req, res, next) => {
    const comment = req.comment
    await comment.populate('author', 'firstName lastName')

    res.status(200).json(comment)
  }),
]

exports.create = [
  protectRoute(),

  postExists,

  commentValidations,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const comment = new Comment({ author: req.user._id, post: req.post._id, body: req.body.body })
    await comment.save()

    res.status(201).json(comment)
  }),
]

exports.update = [
  protectRoute(),

  commentPermissions,

  commentValidations,

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    const comment = await Comment.findByIdAndUpdate(
      req.comment._id,
      { body: req.body.body, updatedAt: Date.now() },
      { new: true }
    )

    res.status(200).json(comment)
  }),
]

exports.delete = [
  protectRoute(),

  commentPermissions,

  asyncHandler(async (req, res, next) => {
    await Comment.findByIdAndDelete(req.comment._id)

    res.status(204).end()
  }),
]
