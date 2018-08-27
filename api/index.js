/**
 * Server Bootstrap
 * The entry point for the server which bootstraps the models, socket.io and controllers.
 * 
 * Notes: 
 *  - app is injected into all controllers as to reduce require calls, and to have access to the global config
 *  - socket.io is avalible to all controllers via socketHook method
 *  - models are set into app, so they are avalible via app.get('models')
 */

require('dotenv').config()

/*
 ** deps
 */
const debug = require('debug')('app:bootstrap');
const express = require('express')
const bodyParser = require('body-parser')
const app = express()

/*
 ** config
 */
debug('Environment:', process.env.NODE_ENV || 'development')
app.set('env', process.env.NODE_ENV || 'development')
app.set('config', require('./config/config.js'))
app.set('json spaces', 2)
app.use(bodyParser.json())

/*
 ** database
 */
app.set('database', require('./config/database'))

/*
 ** model(s)
 */
app.set('model', require('./models')(app))

/*
 ** socket.io
 */
const io = require('./controllers/socket.io')(app)

/*
 ** controllers
 */
const routes = [
  'auth',
  'user',
  'test'
]
routes.forEach(item => {
  debug('Importing controller: ', item)
  let { router, socketHook } = require('./controllers/' + item)(app)

  io.socketHooks.push(socketHook)
  app.use(router)
})

// socket.io listen
io.listen()

/*
 ** error handler
 */
app.use((err, req, res, next) => {
  debug(err.stack)
  res.status(500).json({
    message: err.message,
    name: err.name,
    fatal: err.fatal,
    errno: err.errno,
    code: err.code
  })
})

/*
 ** export to nuxt
 */
module.exports = {
  path: '/api',
  handler: app
}
