const sql = require('mssql');
const secrets = require('./secrets.js');
let pool = null;
module.exports = getConnection;

const config = {
  user: secrets.userName,
  password: secrets.password,
  server: secrets.server,
  database: secrets.database,
  options: secrets.options
};

function getConnection() {
  if (pool) return pool;
  return pool = new Promise(function(resolve, reject) {
    const connection = new sql.ConnectionPool(config, function(err) {
      if (err) {
        pool = null;
        return reject(err);
      }
      return resolve(connection);
    });
  });
}