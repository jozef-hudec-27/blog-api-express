const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, maxlength: 100 },
  firstName: { type: String, required: true, maxlength: 100 },
  lastName: { type: String, required: true, maxlength: 100 },
  isAuthor: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  registeredAt: { type: Date, default: Date.now },
  passwordEncrypted: { type: String, required: true },
})

module.exports = mongoose.model('User', userSchema)
