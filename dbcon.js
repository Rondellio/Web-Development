var mysql = require('mysql');
var pool = mysql.createPool({
  connectionLimit : 10,
  host            : 'classmysql.engr.oregonstate.edu',
  user            : 'cs340_waltersr',
  password        : '{PASSWORD}',
  database        : 'cs340_waltersr'
});

module.exports.pool = pool;
