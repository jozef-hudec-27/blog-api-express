const { protectRoute } = require('../utils/auth')

const router = require('express').Router()

router.get(
  '/protected',

  protectRoute,

  (req, res) => {
    res.json({ message: 'You are authorized.' })
  }
)

module.exports = router
