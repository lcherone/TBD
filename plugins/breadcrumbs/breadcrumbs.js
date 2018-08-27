import breadcrumbs from '~/plugins/breadcrumbs/breadcrumbs.vue'

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
    Vue.prototype.$breadcrumbs = {
      set (items = []) {
        console.log('setting breadcrumbs')
        Plugin.event.$emit('set_items', items)
      }
    }

    /**
     * Registration of <breadcrumbs/> component
     */
    Vue.component('breadcrumbs', breadcrumbs)
  }
}

export default Plugin
