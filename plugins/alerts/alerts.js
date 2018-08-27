import alerts from '~/plugins/alerts/alerts.vue'

const Plugin = {
  install (Vue, options = {}) {
    /**
     * Makes sure that plugin can be installed only once
     */
    if (this.installed) {
      return
    }

    this.installed = true

    /**
     * Create event bus
     */
    this.event = new Vue()

    /**
     * Plugin methods
     */
    Vue.prototype.$alert = {
      show (type = 'info', message = 'You must define a message') {
        // open alert
        Plugin.event.$emit('open', type, message)
      },
      close (type = 'info') {
        // close alert
        Plugin.event.$emit('close', type)
      },
      hide (type = 'info') {
        // close alert
        Plugin.event.$emit('close', type)
      }
    }

    /**
     * Registration of <alerts/> component
     */
    Vue.component('alerts', alerts)
  }
}

export default Plugin
