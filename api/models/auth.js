'use strict'

const debug = require('debug')('app:model:user')

const bcrypt = require('bcrypt')

module.exports = app => {
  const database = app.get('database');

  let Model = this;

  Model.newUser = (username, password, role) => {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) return reject(err);

        let user = new database.row('user', {
          username: username,
          createdAt: new Date()
        })

        let auth = new database.row('auth', {
          password: hash,
          role: role
        })

        auth.setParent(user).then(function() {
          debug('%O', user);
          resolve(user);
        })
      })
    })
  }

  Model.password_verify = async (password, hash) => {
    return await bcrypt.compare(password, hash)
  }

  return Model
}

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
