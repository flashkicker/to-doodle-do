const superagent = require('superagent');
const chai = require('chai');
const expect = chai.expect;
var {mongoose} = require('../server/db/mongoose');
var Task = require('../server/models/task');

var BASE_URL = 'http://localhost:3000';

describe("ToDo - POST Tests", () => {
    var testTask = {
        text: 'Firse test task'
    }
    it("should save a new task in the database and fetch that record from the database", (done) => {
        superagent.post(BASE_URL + '/tasks')
        .send(testTask)
        .set('accept', 'json')
        .end((err, res) => {
            expect(err).to.not.exist;
            expect(res).to.exist;
            expect(res.status).to.equal(200);
            expect(res.body.text).to.equal(testTask.text);
        });
        Task.find().limit(1).sort({$natural:-1}).then((tasks) => {
            expect(tasks[0].text).to.equal(testTask.text);
            done();
        }, (err) => {
            done(err);
        });
    });
});