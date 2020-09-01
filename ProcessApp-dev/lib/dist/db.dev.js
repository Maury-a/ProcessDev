"use strict";

var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'processfollowup.crxgveacrbfm.eu-central-1.rds.amazonaws.com',
  user: 'admin',
  database: 'LoginTutorialDB',
  password: 'cVInydeXRhsSo0ZDtvlt'
});
connection.connect();
module.exports = connection;