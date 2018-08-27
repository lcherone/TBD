/*
 ** Database config
 ** - environment variables values can be found in ./.env 
 */
module.exports = new (require('../lib/database.js'))({
  host: process.env.DB_HOSTNAME,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  multipleStatements: true,
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});
