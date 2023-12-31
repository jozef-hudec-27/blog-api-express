require('dotenv').config()
const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const passport = require('passport')
require('./passport-config')(passport)

const apiRouter = require('./routers/apiRouter')
const authRouter = require('./routers/authRouter')

const app = express()

// database setup
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const mongoDB = process.env.DB_CONNECTION_STRING

dbConnect().catch((err) => console.log(err))
async function dbConnect() {
  if (process.env.NODE_ENV !== 'test') {
    await mongoose.connect(mongoDB)
  }
}

// middleware
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(passport.initialize())

app.use('/api', apiRouter)
app.use('/auth', authRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  res.status(err.status || 500).json({ message: err.message || 'There was an error.' })
})

module.exports = app
