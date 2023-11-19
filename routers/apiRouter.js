const usersController = require('../controllers/usersController')
const postsController = require('../controllers/postsController')
const commentsController = require('../controllers/commentsController')

const router = require('express').Router()

// USERS
router.post('/users/author', usersController.enableAuthor)

// POSTS
router.get('/posts', postsController.index)
router.get('/posts/:postId', postsController.show)
router.post('/posts', postsController.create)
router.put('/posts/:postId', postsController.update)
router.delete('/posts/:postId', postsController.delete)

// COMMENTS
router.get('/posts/:postId/comments', commentsController.index)
router.get('/comments/:commentId', commentsController.show)
router.post('/posts/:postId/comments', commentsController.create)
router.put('/comments/:commentId', commentsController.update)
router.delete('/comments/:commentId', commentsController.delete)

module.exports = router
