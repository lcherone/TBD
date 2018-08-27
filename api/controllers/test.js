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

      debug('')

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
