import Vue from 'vue'
import plugin from '~/plugins/socket.io/plugin'

export default options => {
  Vue.use(plugin, options)
}
