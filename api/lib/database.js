const debug = require('debug')('app:database')
const mysql = require('mysql')

const echasync = {
  do: function(array, fn, callback) {
    function step(i) {
      if (i < array.length) {
        fn(function() {
          step(i + 1)
        }, array[i], i, array)
      }
      else {
        callback()
      }
    }
    step(0)
  }
}

module.exports = function(dbData) {

  var Database = this

  var pool
  var dbSchema = {}
  var tablesRefreshed = false

  function waitForSchema(fn) {
    if (tablesRefreshed) {
      fn()
    }
    else {
      setTimeout(function() {
        waitForSchema(fn)
      }, 10)
    }
  }

  Database.row = function(table, data) {
    var row = this
    if (data !== undefined) row = Object.assign(row, data)
    Object.defineProperty(row, "table", {
      enumerable: false,
      writable: true
    })
    row.table = table
  }

  Database.row.prototype.store = function() {
    var row = this
    return new Promise(function(resolve, reject) {
      if (!Database.isValidDatabase(row)) throw 'not a valid row'

      createTable(row).then(() => {
        return createCols(row)
      }).then(() => {
        var sql = getInsertSql(row)
        row.mendValues()
        var values = Object.keys(row).map(key => row[key])
        return Database.exec(sql, values.concat(values))
      }).then((res) => {
        if (res.insertId != 0) row.id = res.insertId
        resolve()
      })
    }).catch(err => {
      debug('Store Err: ', err)
    })
  }

  Database.row.prototype.findOrCreate = function(data) {
    data = data || {}
    if (data.by === undefined) data.by = Object.keys(row)
    if (data.onCreate === undefined) data.onCreate = {}
    var row = this
    var request = {
      sql: data.by.map(key => key + ' = ? ').join(' AND '),
      vals: data.by.map(key => row[key])
    }

    return new Promise(function(resolve, reject) {
      createTable(row).then(function() {
        createCols(row).then(function() {
          Database.findOne(row.table, request).then(function(res) {
            if (!res) {
              for (var key in data.onCreate) {
                if (data.onCreate.hasOwnProperty(key)) {
                  row[key] = data.onCreate[key]
                }
              }
            }
            else {
              row.id = res.id
            }
            row.store().then(function() {
              resolve()
            })
          }, function(err) { reject(err) })
        })
      })
    })
  }

  Database.row.prototype.getChildren = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      Database.find(table, row.table + 'Id = ?', row.id).then(function(children) {
        resolve(children)
      })
    })
  }

  Database.row.prototype.attachChildren = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      row.getChildren(table).then(function(children) {
        row[table] = children
        resolve()
      })
    })
  }

  Database.row.prototype.addChildren = function(table, array) {
    var row = this
    return new Promise(function(resolve, reject) {
      for (var i = 0; i < array.length; i++) {
        array[i][row.table + 'Id'] = row.id
      }
      Database.storeRows(table, array).then(function(res) {
        resolve(res)
      })
    })
  }

  Database.row.prototype.getCousins = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      var uncleTable = Database.getUncleTableName(row.table, table)
      if (tableExists(uncleTable)) {
        var sql = 'SELECT c.* FROM ' + uncleTable + ' as ut, ' + table + ' as c WHERE ut.' + row.table + 'Id = ? and ut.' + table + 'Id = c.id'
        Database.exec(sql, row.id).then(function(cousins) {
          resolve(Database.arrayToDatabases(table, cousins))
        })
      }
      else {
        debug('Database: uncle table %s does not exist', uncleTable)
        resolve([])
      }
    })
  }

  Database.row.prototype.attachCousins = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      row.getCousins(table).then(function(cousins) {
        row[table] = cousins
        resolve()
      })
    })
  }

  Database.row.prototype.setCousins = function(table, array) {
    var row = this
    return new Promise(function(resolve, reject) {
      Database.storeRows(table, array).then(function(cousins) {
        var uncleTable = Database.getUncleTableName(table, row.table)
        var uncles = []
        for (var i = 0; i < cousins.length; i++) {
          var uncle = {}
          uncle[row.table + 'Id'] = row.id
          uncle[table + 'Id'] = cousins[i].id
          uncles.push(uncle)
        }
        uncles = Database.arrayToDatabases(uncleTable, uncles)
        if (tableExists(uncleTable)) {
          Database.delete(uncleTable, row.table + 'Id = ?', row.id).then(function() {
            Database.storeRows(uncleTable, uncles).then(function() {
              resolve(cousins)
            })
          })
        }
        else {
          Database.storeRows(uncleTable, uncles).then(function() {
            resolve(cousins)
          })
        }
      })
    })
  }

  Database.row.prototype.addCousins = function(table, array) {
    var row = this
    return new Promise(function(resolve, reject) {
      Database.storeRows(table, array).then(function(cousins) {
        var uncleTable = Database.getUncleTableName(table, row.table)
        var uncles = []
        for (var i = 0; i < cousins.length; i++) {
          var uncle = {}
          uncle[row.table + 'Id'] = row.id
          uncle[table + 'Id'] = cousins[i].id
          uncles.push(uncle)
        }
        Database.storeRows(uncleTable, uncles).then(function() {
          resolve(cousins)
        })
      })
    })
  }

  Database.row.prototype.addCousin = function(cousin) {
    var row = this
    return new Promise(function(resolve, reject) {
      cousin.store().then(function() {
        var uncleTable = Database.getUncleTableName(cousin.table, row.table)
        var uncle = new Database.row(uncleTable)
        uncle[row.table + 'Id'] = row.id
        uncle[cousin.table + 'Id'] = cousin.id
        uncle.store().then(function() {
          resolve(cousin)
        })
      })
    })
  }

  Database.row.prototype.removeCousin = function(cousin) {
    var row = this
    return new Promise(function(resolve, reject) {
      var uncleTable = Database.getUncleTableName(row.table, cousin.table)
      var condition = row.table + 'Id = ? AND ' + cousin.table + 'Id = ?'
      Database.delete(uncleTable, condition, [row.id, cousin.id]).then(function() {
        resolve(true)
      })
    })
  }

  Database.row.prototype.getParent = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      Database.load(table, row[table + 'Id']).then(function(parent) {
        resolve(parent)
      }, function(err) { reject(err) })
    })
  }

  Database.row.prototype.attachParent = function(table) {
    var row = this
    return new Promise(function(resolve, reject) {
      row.getParent(table).then(function(parent) {
        row[table] = parent
        resolve()
      }, function(err) { reject(err) })
    })
  }

  Database.row.prototype.setParent = function(parent) {
    var row = this
    return new Promise(function(resolve, reject) {
      parent.store().then(function() {
        row[parent.table + 'Id'] = parent.id
        row.store().then(function() {
          resolve(true)
        })
      })
    })
  }

  Database.row.prototype.delete = function() {
    var row = this
    return new Promise(function(resolve, reject) {
      if (!Database.isValidDatabase(row)) throw 'DEL Err: this is not a valid row!'
      var sql = "DELETE FROM " + row.table + " WHERE id = ?"
      Database.exec(sql, [row.id]).then(res => {
        resolve(true)
      })
    })
  }

  Database.row.prototype.mendValues = function() {
    for (var colName in this) {
      if (this.hasOwnProperty(colName)) {
        this[colName] = mendValue(this[colName])
      }
    }
  }

  Database.storeMultiple = function(rows) {
    return new Promise(function(resolve, reject) {
      var res = []

      function step(i) {
        if (i < rows.length) {
          rows[i].store().then(function() {
            res.push(rows[i])
            step(i + 1)
          })
        }
        else {
          resolve(res)
        }
      }
      step(0)
    })
  }

  Database.storeRows = function(table, array) {
    return new Promise(function(resolve, reject) {
      var res = []
      var rowInstance = new Database.row(table, {})
      for (var i = 0; i < array.length; i++) {
        rowInstance = Object.assign(rowInstance, array[i])
      }
      createTable(rowInstance).then(function() {
        createCols(rowInstance).then(function() {
          var sql = []
          var values = []
          for (var i = 0; i < array.length; i++) {
            var row = new Database.row(table, array[i])
            res.push(row)
            sql.push(getInsertSql(row))
            row.mendValues()
            let rowVals = Object.keys(row).map(key => row[key])
            values = values.concat(rowVals).concat(rowVals)
          }
          Database.exec(sql.join(' '), values.concat(values)).then(function(rows) {
            if (!Array.isArray(rows)) {
              rows = [rows]
            }
            for (var i = 0; i < res.length; i++) {
              res[i].id = rows[i].insertId
            }
            res = Database.arrayToDatabases(table, res)
            resolve(res)
          }, function(err) {
            reject(err)
          })
        })
      })
    })
  }

  function JoinRelatives(rows, more, type) {
    return new Promise(function(resolve, reject) {
      var attachFns = {
        parents: 'attachParent',
        children: 'attachChildren',
        cousins: 'attachCousins'
      }
      if (more === undefined) {
        more = {}
      }
      if (typeof more[type] === "string") {
        more[type] = [more[type]]
      }
      if (Array.isArray(more[type])) {
        echasync.do(rows, function(nextDatabase, row, index) {
          echasync.do(more[type], function(nextRelative, relativeName) {
            let attachFn = attachFns[type]
            rows[index][attachFn](relativeName).then(function() {
              nextRelative()
            })
          }, function() {
            nextDatabase()
          })
        }, function() {
          resolve(rows)
        })
      }
      else {
        resolve(rows)
      }
    })
  }

  function attachJoins(rows, more) {
    return new Promise(function(resolve, reject) {
      JoinRelatives(rows, more, 'parents').then(function(rows) {
        JoinRelatives(rows, more, 'cousins').then(function(rows) {
          JoinRelatives(rows, more, 'children').then(function(rows) {
            resolve(rows)
          })
        })
      })
    })
  }

  Database.find = function(table, restSql, vals, more) {
    return new Promise(function(resolve, reject) {
      waitForSchema(function() {
        if (tableExists(table)) {
          var sql = getSelectSql(table, restSql, vals, more)

          Database.exec(sql, vals).then(function(res) {
            if (res.length > 0) {
              var rows = Database.arrayToDatabases(table, res)
              attachJoins(rows, more).then(function(rows) {
                resolve(rows)
              })
            }
            else {
              resolve([])
            }
          })
        }
        else {
          resolve([])
        }
      })
    })
  }

  Database.findOne = function(table, restSql, vals, more) {
    return new Promise(function(resolve, reject) {
      Database.find(table, restSql, vals, more).then(function(res) {
        if (res.length > 0) {
          resolve(new Database.row(table, toSimpleObject(res[0])))
        }
        else {
          resolve(false)
        }
      }, function(err) { reject(err) })
    })
  }

  Database.load = function(table, id, more) {
    return new Promise(function(resolve, reject) {
      if (id === undefined) throw 'An id must be given!'
      if (!Number.isInteger(id)) throw 'id must be an Integer!'

      Database.findOne(table, table + '.id = ?', id, more).then(function(found) {
        var res = (found.id) ? new Database.row(table, toSimpleObject(found)) : false
        resolve(res)
      })
    }).catch(err => {
      debug('Load Err:', err)
    })
  }

  Database.findByFecundity = function(table, data) {
    return new Promise(function(resolve, reject) {
      if (table === undefined) reject('Err: A table name must be given!')

      var countProp = data.as || data.children + 's'
      var rowize = data.rowize || false
      var order = (data.poorest) ? 'ASC' : 'DESC'
      var sql = 'SELECT t.*, COUNT(*) as ' + countProp + ' FROM ' + table + ' t JOIN ' + data.children + ' c ON c.' + table + 'Id = t.id GROUP BY t.id ORDER BY ' + countProp + ' ' + order
      if (data.limit !== undefined) {
        sql += ' LIMIT ' + data.limit
      }
      Database.exec(sql).then(function(res) {
        if (data.as !== undefined && data.as == '') {
          for (var i = 0; i < res.length; i++) {
            delete res[i][countProp]
            rowize = true
          }
        }
        if (rowize) {
          res = Database.arrayToDatabases(table, res)
        }
        resolve(res)
      })
    })
  }

  Database.findByCousinity = function(table, data) {
    return new Promise(function(resolve, reject) {
      if (table === undefined) reject('Err: A table name must be given!')

      data.children = Database.getUncleTableName(table, data.cousin)
      if (data.as === undefined) data.as = data.cousin + 's'
      Database.findByFecundity(table, data).then(function(res) {
        resolve(res)
      })
    })
  }

  Database.count = function(table, restSql, vals) {
    return new Promise(function(resolve, reject) {
      var more = {
        fields: ['COUNT(*)']
      }
      waitForSchema(function() {
        if (tableExists(table)) {
          Database.find(table, restSql, vals, more).then(function(res) {
            resolve(res[0]['COUNT(*)'])
          })
        }
        else {
          resolve(0)
        }
      })
    })
  }

  Database.delete = function(table, restSql, vals) {
    return new Promise(function(resolve, reject) {
      var sql = "DELETE FROM " + table + " WHERE " + restSql
      Database.exec(sql, vals).then(function(res) {
        resolve(res)
      })
    })
  }

  Database.exec = function(sql, vals) {
    vals = giveValsCorrectLength(sql, vals)
    return new Promise(function(resolve, reject) {
      if (typeof sql !== "string") reject('Err: sql must be a String!')
      if (!Array.isArray(vals) && typeof vals === "object") reject('Err: vals must be an Array or a simple variable!')
      waitForSchema(function() {
        pool.getConnection((err, connection) => {
          if (err) return reject(err)
          debug('USE ' + dbData.database)
          connection.query('USE ' + dbData.database, () => {
            debug(sql, vals)
            connection.query(sql, vals, function(err, res) {
              connection.release()
              if (err) return reject(err)
              resolve(res)
            })
          })
        })
      })
    })
  }

  function toSimpleObject(object) {
    var res = {}
    for (var colName in object) {
      if (object.hasOwnProperty(colName)) {
        res[colName] = object[colName]
      }
    }
    return res
  }

  Database.arrayToDatabases = function(table, array) {
    var res = []
    for (var i = 0; i < array.length; i++) {
      if (!Database.isValidDatabase(array[i])) {
        array[i] = new Database.row(table, toSimpleObject(array[i]))
      }
      res.push(array[i])
    }
    return res
  }

  function giveValsCorrectLength(sql, vals) {
    vals = vals || []
    var questionMarks = sql.match(/\?/g)
    var length = (questionMarks != null) ? questionMarks.length : 0
    for (var i = vals.length; i < length; i++) {
      vals[i] = ''
    }
    return vals
  }

  function getInsertSql(row) {
    var keysPart = Object.keys(row).join(' = ?,') + ' = ?'
    return 'INSERT INTO ' + row.table + ' SET ' + keysPart + ' ON DUPLICATE KEY UPDATE ' + keysPart
  }

  function getSelectSql(table, restSql, vals, more) {
    if (restSql === undefined) {
      restSql = ' '
    }
    var sql = 'SELECT'
    var selects = (more === undefined || more.fields === undefined) ? '*' : more.fields.join(', ')

    sql += ' ' + selects
    sql += ' FROM ' + table

    var wheresBlock = getWheresBlock(restSql)
    if (/(=|>|<|LIKE|REGEXP|BETWEEN|IS|IN|LEAST|COALESCE|INTERVAL|GREATEST|STRCMP)/i.test(wheresBlock)) {
      sql += ' WHERE ' + restSql
    }
    else {
      sql += ' ' + restSql
    }
    return sql
  }

  function getWheresBlock(sql) {
    var wheresEnd = sql.length - 1
    var keyWords = ['order by', 'limit', 'group by', 'join']
    for (var i = 0; i < keyWords.length; i++) {
      var regex = new RegExp(keyWords[i], 'i')
      var match = regex.exec(sql)
      if (match && match.index < wheresEnd) {
        wheresEnd = match.index
      }
    }
    var wheresBlock = sql.slice(0, wheresEnd)
    return wheresBlock
  }

  Database.isValidDatabase = function(row) {
    return (row !== undefined && row.table !== undefined && row instanceof Database.row)
  }

  Database.getUncleTableName = function(t1, t2) {
    var array = [t1, t2]
    return array.sort().join('_')
  }

  function createTable(row) {
    return new Promise(function(resolve, reject) {
      var sql = 'CREATE TABLE IF NOT EXISTS ' + row.table + ' ( id INT(11) UNSIGNED AUTO_INCREMENT PRIMARY KEY )'
      Database.exec(sql).then(function(res) {
        tablesRefreshed = false
        refreshTables().then(function(res) {
          dbSchema = res
          tablesRefreshed = true
        })
        resolve()
      })
    })
  }

  function createCol(row, colName) {
    row[colName] = mendValue(row[colName])
    return new Promise((resolve, reject) => {
      whatActionToCol(row, colName).then(resSql => {
        if (!resSql) resolve()
        else {
          return Database.exec(resSql)
        }
      }).then(execResponse => {
        tablesRefreshed = false
        resolve()
      })
    })
  }

  function createCols(row) {
    return new Promise((resolve, reject) => {
      var cols = Object.keys(row)
      return Promise.all(cols.map(colName => {
        return createCol(row, colName)
      })).then(() => {
        return refreshTables()
      }).then(newSchema => {
        dbSchema = newSchema
        tablesRefreshed = true
        resolve()
      })
    })
  }

  function getDataType(v) {
    switch (typeof v) {
      case "number":
        if (String(v).indexOf(".") > -1) return "DOUBLE"
        if (v > 2147483647) return "BIGINT"
        return "INT"
        break
      case "string":
        if (v.length <= 255) return "VARCHAR(" + v.length + ")"
        return "TEXT"
        break
      case "boolean":
        return "BOOL"
        break
      case "object":
        if (v instanceof Date) return "BIGINT"
        break
      default:
        return "TEXT"
    }
  }

  function mendValue(v) {
    switch (typeof v) {
      case "object":
        if (v instanceof Date) return v.getTime()
        break
      default:
        return v
    }
  }

  function whatActionToCol(row, colName) {
    return new Promise((resolve, reject) => {
      getDBColumn(row.table, colName).then(dbColumn => {
        var skip = true
        var res = ' ALTER TABLE ' + row.table
        var datatype = getDataType(row[colName])
        var command = (dbColumn) ? ' MODIFY COLUMN ' : ' ADD '
        res += command + colName + ' ' + datatype
        var newEntry = String(mendValue(row[colName]))
        if (
          dbColumn === undefined ||
          (dbColumn.name == 'varchar' && datatype == 'TEXT') ||
          (dbColumn.name == 'varchar' && newEntry.length > dbColumn.length) ||
          (dbColumn.name == 'int' && datatype == 'DOUBLE')
        ) {
          skip = false
        }
        if (skip) res = false
        resolve(res)
      })
    })
  }

  function getDBColumn(tableName, colName) {
    return new Promise((resolve, reject) => {
      var table = dbSchema[tableName]
      var res
      if (table && table.hasOwnProperty(colName)) {
        res = dbSchema[tableName][colName]
        var typeRegex = /(\w+)(\((\d+)\))?/g.exec(res)
        res = {
          name: typeRegex[1],
          length: typeRegex[3]
        }
      }
      resolve(res)
    })
  }

  function tableExists(table) {
    return dbSchema.hasOwnProperty(table)
  }

  function refreshTables() {
    return new Promise(function(resolve, reject) {
      var resSchema = {}
      pool.getConnection((err, connection) => {
        if (err) return reject(err)
        connection.query('SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ?', dbData.database, function(err, res) {
          connection.release()
          if (err) return reject(err)
          for (var i = 0; i < res.length; i++) {
            var tableName = res[i].TABLE_NAME
            var colName = res[i].COLUMN_NAME
            var type = res[i].COLUMN_TYPE
            if (resSchema.hasOwnProperty(tableName)) {
              resSchema[tableName][colName] = type
            }
            else {
              resSchema[tableName] = {}
              resSchema[tableName][colName] = type
            }
          }
          resolve(resSchema)
        })
      })
    })
  }

  function connectDb() {
    return new Promise(function(resolve, reject) {
      if (dbData.database === undefined) reject('Err: A database must be given!')
      var dbName = dbData.database
      delete dbData.database

      pool = mysql.createPool(dbData)
      pool.on('connection', function(connection) {
        debug('Database connection made')
      })
      pool.on('acquire', function(connection) {
        debug('Connection %d acquired', connection.threadId);
      })
      pool.on('enqueue', function() {
        debug('Waiting for available connection slot');
      })
      pool.on('release', function(connection) {
        debug('Connection %d released', connection.threadId);
      })

      pool.getConnection((err, connection) => {
        if (err) return reject(err)
        let sql = 'CREATE DATABASE IF NOT EXISTS ' + dbName + ' CHARACTER SET utf8 COLLATE utf8_general_ci';
        debug(sql)
        connection.query(sql, function() {
          dbData.database = dbName
          connection.release()
          resolve()
        })
      })
    })
  }

  connectDb().then(() => {
    return refreshTables()
  }).then(res => {
    dbSchema = res
    tablesRefreshed = true
  })
}
