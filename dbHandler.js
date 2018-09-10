// MySQL handler v0.1 (PrjC SAS)


'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// let botConfig = require('./botConfig_uni');
let botConfig = require('./botConfig');
let config = new botConfig();
let envInfo = config.configInfo();

let mysql = require('mysql');
let connection = mysql.createConnection({
  host: envInfo.database.host,
  user: envInfo.database.user,
  database: envInfo.database.database,
  password: envInfo.database.password,
  port: envInfo.database.port
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Date Formatting pad numbers to two digits…
 **/
function twoDigits(d) {
  if(0 <= d && d < 10) return "0" + d.toString();
  if(-10 < d && d < 0) return "-0" + (-1*d).toString();
  return d.toString();
}
/**
* …and then create the method to output the date string as desired.
**/
Date.prototype.toMysqlFormat = function() {
  return this.getUTCFullYear() + "-" + twoDigits(1 + this.getUTCMonth()) + "-" + twoDigits(this.getUTCDate()) + " " + twoDigits(this.getUTCHours()) + ":" + twoDigits(this.getUTCMinutes()) + ":" + twoDigits(this.getUTCSeconds());
};

var dbHandler = function(){
  
  function dbHandler() {
    _classCallCheck(this, dbHandler);

    // this.dbname = dbname || 'meguild';
    // this.tablename = tablename || 'guildmembers';
    // this.tablestruct = tablestruct || "CREATE TABLE IF NOT EXISTS guildmembers ( id INT PRIMARY KEY AUTO_INCREMENT, fbid BIGINT(13) UNIQUE, name VARCHAR(50) NOT NULL, guild VARCHAR(16) NOT NULL, phase INT UNSIGNED NOT NULL DEFAULT 1, status VARCHAR(50) NOT NULL, badgeid VARCHAR(50), can_send_plus_one BOOLEAN, last_active_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE = MEMORY";
    this.initDB();
  }
  _createClass(dbHandler, [
    {
      key: 'formatTimestamp',
      value: function formatTimestamp() {
        return new Date().toMysqlFormat();
      }
    },
    {
      key: 'endSession',
      value: function endSession() {
        connection.end();
        return new Date().toMysqlFormat();
      }
    },
    {
      key: 'updateDBInfo',
      value: function updateDBInfo(ID, data, callback) {
        callback = typeof callback !== 'undefined' ? callback : null;
  
        let sql = "UPDATE guildmembers SET";
        var i = 0
        for (var property in data ) {
          sql += ((i == 0 ? " " :", ") + property + " = "+connection.escape(data[property]));
          // setVals.push(data[property]);
          i++;
        }
        sql += " WHERE fbid = "+connection.escape(ID);

        connection.query(sql, function (error, results, fields) {
          if (error) throw error;
          console.log('db updated '+ID);
          // connection.end();
          if (callback !== null) {
            callback();
          }
        });
      }
    }
  ,{
    key: 'addUser',
    value: function addUser(ID, data, callback)  {
      callback = typeof callback !== 'undefined' ? callback : null;
        var sql = `INSERT IGNORE INTO guildmembers SET fbid = ${data.ID}, name = "${data.first_name}", phase = 1, status = "${data.status}", can_send_plus_one = false, last_active_time = "${this.formatTimestamp()}";`;
      var query = connection.query(sql, ID, function (error, results, fields) {
        if (error){
          console.log('record not found');
          // throw error;
        }
        console.log('user Added');
        if (callback !== null) {
          callback();
        }
      });
  
    }
  }
  ,{
    key: 'userFound',
    value: function userFound(ID, data, callback)  {
      callback = typeof callback !== 'undefined' ? callback : null;
      var sql = "SELECT * FROM guildmembers WHERE fbid = " + ID;
      var query = connection.query(sql, function (err, result, fields) {
          if (err) throw err;
          console.log('user found');
          console.log((result.length > 0) ? result[0] : 'not found');
          let results = (result.length > 0) ? result[0] : 'not found';
          if (callback !== null) {
            callback(results);
            return;
          }
          return results;
      });
  
    }
  }
  ,{
    key: 'sendQuery',
    value: function sendQuery(ID, qString, callback)  {
      callback = typeof callback !== 'undefined' ? callback : null;
      var query = connection.query(qString, function (error, results, fields) {
        if (error){
          console.log('record not found');
          // throw error;
        }
        if (callback !== null) {
          callback();
        }
      });
  
    }
  }
  ,{
    key: 'createTable',
    value: function createTable(callback) {
      callback = typeof callback !== 'undefined' ? callback : null;
    
      var sql = "CREATE TABLE IF NOT EXISTS guildmembers ( id INT PRIMARY KEY AUTO_INCREMENT, fbid BIGINT(13) UNIQUE, name VARCHAR(50) NOT NULL, guild VARCHAR(16) NOT NULL, phase INT UNSIGNED NOT NULL DEFAULT 1, status VARCHAR(50) NOT NULL, badgeid VARCHAR(50), can_send_plus_one BOOLEAN, last_active_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ) ENGINE = MEMORY";
    
      connection.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
        // connection.end();
        if (callback !== null) {
          callback();
        }
      });
    
    }
  }
  ,{
    key: 'createDatabase',
    value: function createDatabase(callback) {
      callback = typeof callback !== 'undefined' ? callback : null;
      connection.connect(function (err) {
        if (err) {
          console.error('Database connection failed: ' + err.stack);
          return;
        }
        console.log('Connected to database.');
        connection.query("CREATE DATABASE IF NOT EXISTS MEGUILDPDB01;", function (err, result) {
          if (err) throw err;
          console.log("Database created");
          // connection.end();
          if (callback !== null) {
            callback();
          }
        });
      });
    }
  }
  ,{
    key: 'initDB',
    value: function initDB()  {
      this.createDatabase(this.createTable);
    }
  }
]);

  return dbHandler;
}();

exports.default = dbHandler;
module.exports = exports['default'];