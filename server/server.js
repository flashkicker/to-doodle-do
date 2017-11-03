var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var Task = require('./models/task');
var User = require('./models/user');

var app = express();

app.use(bodyParser.json());

app.get('/tasks', (req, res, next) => {
    Task.find().then((tasks) => {
        res.send({
            tasks
        });
    }, (err) => {
        res.status(400).send(err);
    });
});

app.post('/tasks', (req, res, next) => {
    var task = new Task({
        text: req.body.text
    });

    task.save().then((document) => {
        res.send(document);
    }, (err) => {
        res.status(400).send(err);
    })
});

app.listen(3000);