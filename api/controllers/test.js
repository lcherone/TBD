'use strict'

// init debug
const debug = require('debug')('app:controller:test')

// init base controller
const BaseController = require('../base/controller.js')

/**
 * Index Controller
 */
class Index extends BaseController {
  /**
   *
   */
  constructor(app) {
    super(app)

    // set config
    this.config = this.app.get('config')
    this.database = this.app.get('database')
    this.model = this.app.get('model')
  }

  /**
   * Controller socket.io hook
   * 
   * @param {object} socket - the connected socket
   * @param {object} io     - the io server handler
   * @param {array} clients - array of connected clients
   */
  async socketHook(socket, io, clients) {
    //debug(socket, io, clients)

    socket.on('test', data => {
      debug('io: socket event [client] [user/test]:', data)
      io.emit('result/test', { for: 'everyone' })
    })
  }

  async get(req, res, next) {
    //
    try {

      var token = jwt.sign({
        myclaim: 'something'
      }, {
        audience: 'myaud',
        issuer: 'myissuer',
        jwtid: '1',
        subject: 'user'
      })

      setTimeout(function() {
        var token2 = jwt.refresh(token, { verify: { audience: 'myaud', issuer: 'myissuer' }, jwtid: '2' })

        console.log(jwt.decode(token))
        console.log(jwt.decode(token2))
      }, 3000)


      //let user = await this.models.profile.newUser('admin', 'admin')

      // var DB = new Database({
      //     host: process.env.DB_HOSTNAME,
      //     user: process.env.DB_USERNAME,
      //     password: process.env.DB_PASSWORD,
      //     database: process.env.DB_DATABASE
      // });

      // var user = new DB.row('user',{
      //     username: 'Steve',
      //     email: 'steve@example.com',
      //     registeredAt: new Date()
      // });

      // var auth = new DB.row('auth',{
      //     password: 'my-pass'
      // });

      // auth.setParent(user).then(function() {

      // });

      // user.store().then(function(){
      //     console.log(user);
      // });

      //let result = await this.model.user.count()


      debug('')
      // debug(await this.database.find('user'))

      //let user = await this.models.user.newUser('admin', 'admin')

      res.json('')
    }
    catch (err) {
      return next(err)
    }
  }

}

/*
 **
 */

// init dep(s)
const bcrypt = require('bcrypt')

// init middleware(s)
const authMiddleware = require('../middlewares/auth');
const jwt = require('../lib/jwt');

// init express router
const { Router } = require('express')
const router = Router()

/**
 * Receive app express instance, 
 *  - bootstrap controllers, define and export routes and socketEvents
 */
module.exports = app => {

  /*
   ** Init controllers
   */
  const Controller = {
    Index: new Index(app)
  }

  /*
   ** Set routes
   */
  // GET /api/users
  router.get('/test', (...args) => Controller.Index.get(...args))

  return {
    router: router,
    socketHook: (...args) => Controller.Index.socketHook(...args)
  }
}
