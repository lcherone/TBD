/**
 * Socket.io Plugin
 *
 * Initialised in layouts/default.vue,
 *  - not a global plugin as it would init on auth page.
 */
import io from 'socket.io-client'

const Plugin = {
  install (Vue, options = {}) {
    /**
     * Single instance
     */
    if (this.installed) {
      return
    }
    this.installed = true

    //
    this.route = options.route

    /**
     * Create event bus
     */
    this.event = new Vue()

    // init socket.io
    var socket = io(':3030', {
      query: { jwt: options.jwt }
    })

    /**
     * on components events
     */
    this.event.$on('location', data => {
      socket.emit('location', data)
    })
    this.event.$on('chat/open', data => {
      socket.emit('chat/open', data)
    })
    this.event.$on('chat/message', data => {
      socket.emit('chat/message', data)
    })

    /**
     * on socket events
     */

    // refresh token
    socket.on('refresh_token', data => {
      socket.disconnect()
      socket.io.opts.query = { jwt: data.token }
      socket.connect()
    })

    // location (a user navigated to a page)
    socket.on('result/location', data => {
      // check if a user is on same page
      // - get me
      let me = data[socket.id]
      // working state
      let state = {
        multi_tabs: false,
        other_user: false
      }

      // check for multiple browsers open
      Object.keys(data).forEach(key => {
        if (key !== socket.id) {
          console.log(data[key])
          // check for multiple browsers open
          if (me.id === data[key].id) {
            state.multi_tabs = true
          }
          // check for anouther user is viewing the page (pass back user object)
          if (data[key].data.location && data[key].data.location.name === this.route.name) {
            state.other_user = data[key]
          }
        }
      })
      // emit events to component
      Plugin.event.$emit('user/multi_tabs', state.multi_tabs)
      Plugin.event.$emit('user/other_user', state.other_user)
    })

    // user (a users state changed [login/logout])
    socket.on('result/users', data => {
      Plugin.event.$emit('result/users', data)
    })

    // chat open small
    socket.on('chat/open/recv', data => {
      Plugin.event.$emit('chat/open/recv', data)
    })

    // chat message
    socket.on('chat/message/recv', data => {
      Plugin.event.$emit('chat/message/recv', data)
    })

    //
    socket.on('connection', client => {
      // Vue.socketSessionid = this.socket.sessionid
      console.log('WS connection: ', client)
    })

    socket.on('connect', () => {
      // Vue.socketSessionid = this.socket.sessionid
      console.log('WS connected: ', socket)
    })

    socket.on('disconnect', () => {
      console.log('WS disconnected')
    })

    /**
     * Plugin methods
     */
    Vue.prototype.$io = {
      socket: socket
    }
  }
}

export default Plugin
