'use strict'

module.exports = class BaseController {
  /**
   *
   */
  constructor(app) {
    this.app = app
    
    this.hashids = new(require('hashids'))(app.get('config').HASHID.salt, app.get('config').HASHID.length)
  }

}
