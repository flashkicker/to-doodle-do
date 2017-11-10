var mongoose = require('mongoose');

var Task = mongoose.model('Task', {
    text: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Types.ObjectId,
        required: true
    }
});

module.exports = Task;