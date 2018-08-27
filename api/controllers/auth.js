'use strict'

// init debug
const debug = require('debug')('app:controller:auth')

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
  async socketHook(socket, io, clients) {
    debug('socketHook')
    this.io = io
  }

  async post(req, res, next) {

    //
    try {
      // create initial users if none in db (username, password, role)
      if (await this.model.user.count() === 0) {
        await this.model.auth.newUser('admin', 'admin', 'admin')
        await this.model.auth.newUser('user', 'user', 'user')
      }

      //
      let user = await this.model.user.findOne('username = ?', [req.body.user], { children: 'auth' })

      //
      if (!user) {
        return res.status(401).json({
          error: {
            message: 'Wrong username or password!'
          }
        })
      }

      // check user has auth
      if (!user.auth || user.auth.length !== 1) {
        return res.status(401).json({
          error: {
            message: 'Error fetching authentication!'
          }
        })
      }

      // verify password
      if (!await this.model.auth.password_verify(req.body.pass, user.auth[0].password)) {
        return res.status(401).json({
          error: {
            message: 'Wrong username or password!'
          }
        })
      }

      // hashid encode user id
      user.id = this.hashids.encode(user.id)

      //
      res.json({
        jwt: jwt.sign({
          id: user.id,
          role: user.auth[0].role,
        })
      })

      // emit that user just signed in
      if (this.io) {
        this.io.emit('user/sign-in', { id: user.id })
      }
      else {
        debug('SocketHook error: Failed to set [this.io]')
      }

      // rehash password
      // this.model.profile.hashPassword(req.body.user, req.body.pass)

      // update login last
      // userModel.updateLoginLast(req.body.user)

      // update login count
      // userModel.updateLoginCount(req.body.user)

    }
    catch (err) {
      return next(err)
    }
  }

}

// init dep(s)
const bcrypt = require('bcrypt')
const fs = require('fs')
const jwt = require('../lib/jwt');

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
  // GET /api/auth
  router.post('/auth', (...args) => Controller.Index.post(...args))

  return {
    router: router,
    socketHook: (...args) => Controller.Index.socketHook(...args)
  }
}
