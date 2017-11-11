var express = require('express');
var router = express.Router();
const _ = require('lodash');

var {mongoose} = require('../db/mongoose');
var User = require('../models/user');
var authenticate = require('../middleware/authenticate');

router.get('/register', (req, res) => {
  res.render('register', {
    title: 'To-Doodle-Do'
  });
});

// Create a new user
router.post('/register', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    req.session.token = token;
    res.redirect('/');
  }).catch((err) => {
    res.status(400).send(err);
  });
});

router.get('/login', (req, res) => {
  res.render('login', {
    title: 'To-Doodle-Do'
  });
});

// Send login request for a user and return a token
router.post('/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  
  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      req.session.token = token;
      res.redirect('/');
    });
  }).catch((err) => {
    res.render('login', {
      title: 'To-Doodle-Do',
      err: 'Email or password are incorrect'
    })
  });
});

// Get a user's account info
router.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

// Logout a user (delete token)
router.delete('/logout', authenticate, (req, res) => {
  req.session.destroy();
})

module.exports = router;
