
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

module.exports = app => {
  
  var models = [];
  fs.readdirSync(__dirname).filter(file => {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  }).forEach(file => {
    file = path.join(__dirname, file);
    models[path.parse(file).name] = (require(file))(Object.assign({}, {}, app));
  });
  
  return models;
};
