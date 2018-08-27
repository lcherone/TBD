module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: 'TBD',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  router: {
    middleware: ['check-auth']
  },
  serverMiddleware: ['~/api/index.js'],
  /*
   ** Customize the progress bar color
   */
  loading: { color: '#3B8070' },
  /*
   ** Global Plugins
   */
  plugins: [
    { src: '~plugins/storage.js', ssr: false },
    '~/plugins/vuetify.js',
    '~/plugins/breadcrumbs/index.js',
    '~/plugins/alerts/index.js',
    '~/plugins/prompt/index.js',
    '~/plugins/hashids.js'
  ],
  /*
   ** Global CSS
   */
  css: [
    '~/assets/fonts/roboto.css',
    'material-design-icons-iconfont/dist/material-design-icons.css',
    'vuetify/dist/vuetify.min.css',
    '~/assets/css/main.css'
  ],
  build: {
    extractCSS: true,
    vendor: [
      '~/plugins/vuetify.js',
      'babel-polyfill',
      'axios'
    ],
    /*
     ** Run ESLint on save
     */
    extend(config, ctx) {
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
