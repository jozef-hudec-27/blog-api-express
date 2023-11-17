const passport = require('passport')

const router = require('express').Router()

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You are authorized.' })
})

module.exports = router
