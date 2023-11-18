const asyncHandler = require('express-async-handler')
const Post = require('../models/post')

const postExists = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId)

  if (!post) {
    return res.status(404).json({ message: 'Post not found.' })
  }

  req.post = post
  next()
})

exports.postExists = postExists

// Succeeds if post exists and user is admin or author of post
exports.postPermissions = [
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
