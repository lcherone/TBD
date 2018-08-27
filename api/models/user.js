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
