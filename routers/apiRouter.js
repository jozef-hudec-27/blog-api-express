const usersController = require('../controllers/usersController')
const postsController = require('../controllers/postsController')

const router = require('express').Router()

// USERS
router.post('/users/author', usersController.enableAuthor)

// POSTS
router.post('/posts', postsController.create)

module.exports = router
