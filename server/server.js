const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var Task = require('./models/task');
var User = require('./models/user');
var authenticate = require('./middleware/authenticate');

var app = express();

app.use(bodyParser.json());

app.post('/tasks', authenticate, (req, res) => {
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

app.get('/tasks', authenticate, (req, res) => {
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

app.get('/tasks/:id', authenticate, (req, res) => {
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

app.delete('/tasks/:id', authenticate, (req, res) => {
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

app.patch('/tasks/:id', authenticate, (req, res) => {
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

app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    var user = new User(body);
    
    user.save().then(() => {
        return user.generateAuthToken();
    }).then((token) => {
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then((user) => {
        return user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        });
    }).catch((err) => {
        res.status(400).send();
    });
});

app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send();
    }, () => {
        res.status(400).send();
    })
})

app.listen(3000);