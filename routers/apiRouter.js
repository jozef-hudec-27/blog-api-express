const usersController = require('../controllers/usersController')
const postsController = require('../controllers/postsController')

const router = require('express').Router()

// USERS
router.post('/users/author', usersController.enableAuthor)

// POSTS
router.post('/posts', postsController.create)
router.put('/posts/:id', postsController.update)
router.delete('/posts/:id', postsController.delete)

module.exports = router
