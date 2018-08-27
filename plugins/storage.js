import Vue from 'vue'

const Storage = {
  install (Vue, options) {
    Vue.prototype.$storage = {
      get (key) {
        if (process.browser) {
          let value = window.localStorage.getItem(options.prefix + key)
          if (value) {
            try {
              return JSON.parse(window.localStorage.getItem(options.prefix + key))
            } catch (Error) {
              this.clear()
            }
          }
          return null
        }
      },
      set (key, value) {
        if (process.browser) {
          window.localStorage.setItem(options.prefix + key, JSON.stringify(value))
        }
      },
      isset (key) {
        if (process.browser) {
          return (options.prefix + key in window.localStorage)
        }
      },
      remove (key) {
        if (process.browser) {
          window.localStorage.removeItem(options.prefix + key)
        }
      },
      clear () {
        if (process.browser) {
          var arr = []
          for (var i = 0; i < window.localStorage.length; i++) {
            if (window.localStorage.key(i).substring(0, options.prefix.length) === options.prefix) {
              arr.push(window.localStorage.key(i))
            }
          }
          for (i = 0; i < arr.length; i++) {
            window.localStorage.removeItem(arr[i])
          }
        }
      }
    }
  }
}

Vue.use(Storage, { prefix: 'store_' })
