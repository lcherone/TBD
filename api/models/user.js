'use strict'

const debug = require('debug')('app:model:user')

const bcrypt = require('bcrypt')

module.exports = app => {
  const database = app.get('database');

  let Model = Object.assign({}, database, this);
  
  Model.count = async (where, values) => {
    return await database.count('user', where, values)
  }
  
  Model.find = async (where, values, extra) => {
    return await database.find('user', where, values, extra)
  }
  
  Model.findOne = async (where, values, extra) => {
    return await database.findOne('user', where, values, extra)
  }
  
  return Model
}


// module.exports = (sequelize, DataTypes) => {
//   var User = schema

//   //
//   User.newUser = function(username, password) {
//     return new Promise((resolve, reject) => {
//       bcrypt.hash(password, 10, (err, hash) => {
//         if (err) return reject(err);

//         this.findOrCreate({
//           where: { handle: username },
//           defaults: { password: hash },
//           raw: true
//         }).spread(async (user, created) => {
//           //
//           debug('%O', user); debug('Created: ', created)

//           if (created) {
//             user = await this.findById(user.id, { raw: true })
//           }

//           resolve(user)
//         })
//       })
//     })
//   }
  
//   //
//   User.hashPassword = function(username, password) {
//     return new Promise((resolve, reject) => {
//       bcrypt.hash(password, 10, (err, hash) => {
//         if (err) return reject(err);

//         this.update(
//           { password:hash },
//           { where: { handle: username }}
//         ).spread(async (rows) => {
//           //
//           debug(rows);

//           resolve(rows)
//         })
//       })
//     })
//   }

//   // User.associate = function(models) {
//   //   models.User.hasMany(models.Task);
//   // };

//   return User
// }
