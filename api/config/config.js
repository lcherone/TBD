/*
 ** Application config
 ** - environment variables values can be found in ./.env 
 */
module.exports = {
  HTTP_PORT: process.env.HTTP_PORT,
  SOCKET_IO_PORT: process.env.SOCKET_IO_PORT,
  JWT_EXPIRES_IN: '60s',
  HASHID: {
    salt: 'salty',
    length: 10
  }
}
