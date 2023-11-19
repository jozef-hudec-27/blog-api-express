const asyncHandler = require('express-async-handler')
const Comment = require('../models/comment')

const commentExists = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId)

  if (!comment) {
    return res.status(404).json({ message: 'Comment not found.' })
  }

  req.comment = comment
  next()
})

exports.commentExists = commentExists

exports.commentPermissions = [
  commentExists,

  // Only comment author or admin can update/delete comment
  (req, res, next) => {
    if (!req.user.isAdmin && req.comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden.' })
    }

    next()
  },
]
