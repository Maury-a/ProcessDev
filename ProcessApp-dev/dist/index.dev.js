"use strict";

var express = require('express');

var app = express();

var bodyParser = require('body-parser');

var cors = require('cors'); // set up port


var PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors()); // add routes

var router = require('./routes/router.js');

app.use('/api', router); // run server

app.listen(PORT, function () {
  return console.log("Server running on port ".concat(PORT));
});