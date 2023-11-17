const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')
const passport = require('passport')

router.post('/register', usersController.register)
router.post('/login', usersController.login)
router.post('/refresh', usersController.refresh)
router.post('/logout', usersController.logout)
router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You are authorized.' })
})

module.exports = router
