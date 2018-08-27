'use strict'

// init debug
const debug = require('debug')('app:controller:user')

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
    this.model = this.app.get('model')
  }

  /**
   * Controller socket.io hook
   *
   * @param {object} socket - the connected socket
   * @param {object} io     - the io server handler
   * @param {array} clients - array of connected clients
   */
  async socketHook (socket, io, clients) {
    debug('socketHook')
    this.io = io
  }

  async get(req, res, next) {
    // check admin role
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        error: {
          message: 'Access denied!'
        }
      })
    }

    //
    try {
      let users = await this.model.user.find()

      //
      users.forEach(item => {
        item.id = this.hashids.encode(item.id)
      })

      res.json(users)
    }
    catch (err) {
      return next(err)
    }
  }

  post() {

  }
}

// init middleware(s)
const authMiddleware = require('../middlewares/auth');

// init express router
const { Router } = require('express')
const router = Router()

/**
 * Receive app express instance, bootstrap controllers and define routes and return.
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
  router.get('/users', authMiddleware, (...args) => Controller.Index.get(...args))
  // GET /api/users/:id
  router.get('/users/:id', authMiddleware, (...args) => Controller.Index.get(...args))

  return {
    router: router,
    socketHook: (...args) => Controller.Index.socketHook(...args)
  }
}

