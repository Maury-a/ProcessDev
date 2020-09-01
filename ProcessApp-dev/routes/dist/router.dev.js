"use strict";

var express = require('express');

var router = express.Router();

var bcrypt = require('bcryptjs');

var uuid = require('uuid');

var jwt = require('jsonwebtoken');

var db = require('../lib/db.js');

var userMiddleware = require('../middleware/users.js');

router.get('/sign-up', userMiddleware.validateRegister, function (req, res, next) {});
router.get('/login', function (req, res, next) {}); // routes/router.js

router.get('/secret-route', userMiddleware.isLoggedIn, function (req, res, next) {
  console.log(req.userData);
  res.send('This is the secret content. Only logged in users can see that!');
});
module.exports = router; // routes/router.js

router.post('/sign-up', userMiddleware.validateRegister, function (req, res, next) {
  db.query("SELECT * FROM users WHERE LOWER(username) = LOWER(".concat(db.escape(req.body.username), ");"), function (err, result) {
    if (result.length) {
      return res.status(409).send({
        msg: 'This username is already in use!'
      });
    } else {
      // username is available
      console.log("Le username est valide");
      bcrypt.hash(req.body.password, 10, function (err, hash) {
        console.log("Le passwd est", req.body.password);

        if (err) {
          return res.status(500).send({
            msg: err
          });
        } else {
          // has hashed pw => add to database
          db.query("INSERT INTO USER (id, username, password, registered) VALUES ('".concat(uuid.v4(), "', ").concat(db.escape(req.body.username), ", ").concat(db.escape(hash), ", now())"), function (err, result) {
            if (err) {
              throw err;
              console.log("Je crash ici");
              return res.status(400).send({
                msg: err
              });
            }

            return res.status(201).send({
              msg: 'Registered!'
            });
          });
        }
      });
    }
  });
}); // routes/router.js

router.post('/login', function (req, res, next) {
  db.query("SELECT * FROM users WHERE username = ".concat(db.escape(req.body.username), ";"), function (err, result) {
    // user does not exists
    if (err) {
      throw err;
      return res.status(400).send({
        msg: err
      });
    }

    if (!result.length) {
      return res.status(401).send({
        msg: 'Username or password is incorrect!'
      });
    } // check password


    bcrypt.compare(req.body.password, result[0]['password'], function (bErr, bResult) {
      // wrong password
      if (bErr) {
        throw bErr;
        return res.status(401).send({
          msg: 'Username or password is incorrect!'
        });
      }

      if (bResult) {
        var token = jwt.sign({
          username: result[0].username,
          userId: result[0].id
        }, 'SECRETKEY', {
          expiresIn: '7d'
        });
        db.query("UPDATE USER SET last_login = now() WHERE id = '".concat(result[0].id, "'"));
        return res.status(200).send({
          msg: 'Logged in!',
          token: token,
          user: result[0]
        });
      }

      return res.status(401).send({
        msg: 'Username or password is incorrect!'
      });
    });
  });
});