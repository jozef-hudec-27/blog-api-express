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
