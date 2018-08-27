import * as axios from 'axios'
import { setToken } from '../utils/auth'

let options = {}
// The server-side needs a full url to works
if (process.server) {
  options.baseURL = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3000}`
}

const instance = axios.create(options)

instance.interceptors.response.use(function (response) {
  return response
}, function (error) {
  if (error.response.status === 401) {
    if (error.response.data && error.response.data.error.err === 'token_refreshed') {
      setToken(error.response.data.error.token)
      error.config.headers['authorization'] = error.response.data.error.token
      return axios.request(error.config)
    } else {
      window.location = '/auth'
    }
  } else {
    return Promise.reject(error)
  }
})

export default instance
