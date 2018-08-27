'use strict'

const debug = require('debug')('app:socket.io')

// libs
const jwt = require('../lib/jwt');
const hashids = new(require('hashids'))('salty', 10)

class Server {
  /**
   *
   */
  constructor(app) {
    // app is instance of express
    this.app = app

    // set config
    this.config = this.app.get('config')
    this.model = this.app.get('model')

    // socket.io
    this.http = require('http').Server(app)
    this.io = require('socket.io')(this.http)
    this.clients = {}
    this.socketHooks = []
  }
  
  setHooks(socketHooks) {
    this.socketHooks = socketHooks
  }

  /**
   * Start server and listen
   *  - on['connection'] - verify passed jwt, load user into this.clients
   */
  listen() {

    this.http.listen(this.config.SOCKET_IO_PORT, () => {
      debug('io: ws server started [port: ' + this.config.SOCKET_IO_PORT + ']')
    })

    this.io.on('connection', async (socket) => {
      if (typeof socket.handshake.query != "undefined") {
        try {
          // verify jwt
          let user = jwt.verify(socket.handshake.query.jwt)

          // decode id and load user data
          let id = hashids.decode(user.id)
          if (id.length === 0) {
            throw Error('Invalid user id in JWT')
          }
          
          let data = await this.model.user.findOne('id = ?', [id[0]])
          if (!data) {
            throw Error('User not found')
          }
          // set user data
          user.data = JSON.parse(JSON.stringify(data))

          debug('io: user connected: ' + socket.id + ' ('+ user.data.username +')')

          // set user into clients
          this.clients[socket.id] = user

          // call events method
          this.events(socket)
        }
        catch (err) {
          debug(err.name)
          // issue new token
          if (err.name === 'TokenExpiredError') {
            let token = jwt.decode(socket.handshake.query.jwt)

            delete token.payload.iat
            delete token.payload.nbf
            delete token.payload.exp
            
            return socket.emit('refresh_token', {
              token: jwt.sign(Object.assign({}, {}, token.payload))
            })
          }
          debug('io error: user connected: ' + socket.id, err)
          return err
        }
      }
    })

    return this.io
  }

  events (socket) {
    //
    debug('io: injecting controller socket hooks')
    this.socketHooks.forEach(socketHook => {
      socketHook(socket, this.io, this.clients)
    })
    
    // connected
    this.io.emit('user/connected', {})

    // user disconnected
    socket.on('disconnect', () => {
      this.io.emit('user/sign-out', {})
      debug('io: user disconnected: ' + socket.id + ' ('+ this.clients[socket.id].data.username +')')
      delete this.clients[socket.id]
    })

    // get users
    socket.on('users', data => {
      debug('io: client event [users]', socket.id)
      socket.emit('result/users', this.clients)
    })
    
    // location
    socket.on('location', data => {
      debug('io: client event [location]', socket.id, data)
      this.clients[socket.id].data.location = data
      // emit to all users
      this.io.emit('result/location', this.clients)
    })
    
    // open_small_chat
    socket.on('chat/open', data => {
      debug('io: client event [chat/open]', socket.id, data)
      // find socket id for user
      Object.keys(this.clients).forEach(socket_id => {
        // broadcast to the user to trigger open chat
        if (data === this.clients[socket_id].id) {
          this.io.to(socket_id).emit('chat/open/recv', { id: this.clients[socket.id].id });
        }
      })
    })
    
    // open_small_chat
    socket.on('chat/message', data => {
      debug('io: client event [send_chat_message]', socket.id, data)
      // find socket id for user
      Object.keys(this.clients).forEach(socket_id => {
        // broadcast to the user the chat message
        if (data.user === this.clients[socket_id].id) {
          this.io.to(socket_id).emit('chat/message/recv', { id: this.clients[socket.id].id, message: data.message, date: new Date() });
        }
      })
    })

  }

}

module.exports = app => {
  return new Server(app)
}
