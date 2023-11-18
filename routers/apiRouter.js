const { protectRoute } = require('../utils/auth')
const usersController = require('../controllers/usersController')

const router = require('express').Router()

router.post('/users/author', usersController.enableAuthor)

router.get(
  '/protected',

  protectRoute,

  (req, res) => {
    console.log(req.user)
    res.json({ message: 'You are authorized.' })
  }
)

module.exports = router
