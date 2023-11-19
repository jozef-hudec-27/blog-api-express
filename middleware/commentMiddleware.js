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

  // Only comment author or admin can update & delete comment, post author can delete comment
  async (req, res, next) => {
    if (req.user.isAdmin || req.comment.author.toString() === req.user._id.toString()) {
      return next()
    }

    // Post author can delete
    if (req.method === 'DELETE') {
      await req.comment.populate('post', 'author')
      const post = req.comment.post

      if (post.author.toString() === req.user._id.toString()) {
        return next()
      }
    }

    res.status(403).json({ message: 'Forbidden' })
  },
]
