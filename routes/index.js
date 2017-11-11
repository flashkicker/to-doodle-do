var express = require('express');
var router = express.Router();
const _ = require('lodash');

var {mongoose} = require('../db/mongoose');
var Task = require('../models/task');
var authenticate = require('../middleware/authenticate');

/* GET home page. */
router.get('/', authenticate, function(req, res, next) {
  token = req.session.token;
  res.render('index', {
    title: 'To-Doodle-Do'
  });
});

// Add a new task
router.post('/tasks', authenticate, (req, res) => {
    var task = new Task({
        text: req.body.text,
        _creator: req.user._id
    });
    
    task.save().then((document) => {
        res.send(document);
    }, (err) => {
        res.status(400).send(err);
    })
});


// Get all tasks created by a user
router.get('/tasks', authenticate, (req, res) => {
    Task.find({
        _creator: req.user._id
    }).then((tasks) => {
        res.send({
            tasks
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

// Get a task by passing it's id in the parameter
router.get('/tasks/:id', authenticate, (req, res) => {
    var id = req.params.id;
    
    if(mongoose.Types.ObjectId.isValid(id)) {
        Task.findOne({
            _id: id,
            _creator: req.user._id
        }).then((task) => {
            if(task != null) {
                res.send({
                    task
                });
            }
            else {
                res.sendStatus(404);
            }
        }, (err) => {
            res.send(err);
        });
    }
    else {
        return res.sendStatus(404);
    }
})

// Delete a task
router.delete('/tasks/:id', authenticate, (req, res) => {
    var id = req.params.id;
    
    if(mongoose.Types.ObjectId.isValid(id)) {
        Task.findOneAndRemove({
            _id: id,
            _creator: req.user._id
        }).then((task) => {
            if(task != null) {
                res.send({
                    task
                });
            }
            else {
                res.sendStatus(404);
            }
        }, (err) => {
            res.send(err);
        });
    }
    else {
        return res.sendStatus(404);
    }
});

// Update a task
router.patch('/tasks/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if(mongoose.Types.ObjectId.isValid(id)) {
        if(_.isBoolean(body.completed) && body.completed) {
            body.completedAt = new Date().getTime();
        }
        else {
            body.completed = false;
            body.completedAt = null;
        }
        
        Task.findOneAndUpdate({
            _id: id,
            _creator: req.user._id
        }, {$set: body}, {new: true}).then((task) => {
            if(task != null) {
                console.log(task);
                res.send({
                    task
                });
            }
            else {
                res.sendStatus(404);
            }
        }).catch((err) => {
            res.send(err);
        })
    }
    else {
        res.sendStatus(404);
    }
})

module.exports = router;
