const { body } = require('express-validator')

exports.postValidations = [
  body('title', 'Post must have a title between 1 and 200 characters.').trim().isLength({ min: 1, max: 200 }).escape(),

  body('body', 'Post must have a body.').trim().isLength({ min: 1 }).escape(),

  body('isPublished').optional({ values: 'falsy' }).isBoolean(),
]
