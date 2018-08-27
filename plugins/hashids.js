import Vue from 'vue'

const Plugin = {
  install (Vue) {
    /**
     * Makes sure that plugin can be installed only once
     */
    if (this.installed) {
      return
    }

    this.installed = true

    /**
     * Plugin methods
     */
    Vue.prototype.$hashids = new (require('hashids'))('salty', 10)
  }
}

Vue.use(Plugin)
