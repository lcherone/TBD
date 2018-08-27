const debug = require('debug')('app:jwt')

const fs = require('fs')
const jwt = require('jsonwebtoken')
const config = require('../config/config');

module.exports = new (function() {

  this.options = {
    algorithm: 'RS256',
    keyid: '1',
    noTimestamp: false,
    expiresIn: config.JWT_EXPIRES_IN
  }

  const privateKey = fs.readFileSync(__dirname + '/../../files/certs/private.key')
  const publicKey = fs.readFileSync(__dirname + '/../../files/certs/public.pem')

  var JWT = this

  JWT.sign = function(payload, options) {
    options = options || {}
    debug('[sign]', payload, options)

    return jwt.sign(payload, privateKey, Object.assign({}, options, this.options))
  }

  JWT.refresh = function(token, options) {
    options = options || {verify:{}}
    debug('[refresh]', token, options)

    const payload = jwt.verify(token, publicKey, options.verify)
    delete payload.iat
    delete payload.exp
    delete payload.nbf
    delete payload.jti

    return jwt.sign(payload, privateKey, Object.assign({}, this.options, { jwtid: options.jwtid }))
  }

  JWT.verify = function(token, options) {
    options = options || {verify:{}}
    debug('[verify]', token, options)

    return jwt.verify(token, publicKey, options.verify)
  }
  
  JWT.decode = function(token) {
    debug('[decode]', token)

    return jwt.decode(token, { complete: true })
  }

  return JWT
})
