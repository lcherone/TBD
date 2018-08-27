// init debug
const debug = require('debug')('app:middlewares:auth')

// libs
const jwt = require('../lib/jwt');

//
const config = require('../config/config.js')

module.exports = function (req, res, next) {
  /*
   * Check authorization header
   */
  if (req.hasOwnProperty('headers') && req.headers.hasOwnProperty('authorization')) {
    try {
      req.user = jwt.verify(req.headers['authorization'])
    } catch (err) {
      debug(err.name)
      // issue new token
      if (err.name === 'TokenExpiredError') {
        let token = jwt.decode(req.headers['authorization'])

        delete token.payload.iat
        delete token.payload.nbf
        delete token.payload.exp
        
        return res.status(401).json({
          error: {
            err: 'token_refreshed',
            msg: 'JWT token refreshed',
            token: jwt.sign(Object.assign({}, {}, token.payload))
          }
        })
      }
      return res.status(401).json({
        error: {
          msg: 'Failed to authenticate token!'
        }
      })
    }
  } else {
    debug('Token required!')
    return res.status(401).json({
      error: {
        msg: 'Token required!'
      }
    })
  }
  debug('Token valid!')
  next()
  return
}
