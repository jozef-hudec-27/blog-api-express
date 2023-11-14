const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
  body: { type: String, required: true, maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: 'Date', default: Date.now },
  updatedAt: { type: 'Date', default: Date.now },
})

module.exports = mongoose.model('Comment', commentSchema)
