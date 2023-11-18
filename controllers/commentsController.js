const { postExists } = require('../middleware/postMiddleware')
const { commentExists } = require('../middleware/commentMiddleware')
const asyncHandler = require('express-async-handler')
const Comment = require('../models/comment')

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
