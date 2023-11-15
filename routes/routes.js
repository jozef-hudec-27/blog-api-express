const express = require('express')
const router = express.Router()
const usersController = require('../controllers/usersController')

router.post('/register', usersController.register)

module.exports = router
