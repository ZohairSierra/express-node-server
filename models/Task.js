const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Create Schema 
const TaskSchema = new Schema({
    text: {
        type: String,
        required: true
    },
    day: {
        type: String,
        required: true
    },
    reminder: {
        type: Boolean,
        required: true,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

Task = mongoose.model('task', TaskSchema);
module.exports = Task;

// Can also be written as module.exports = Task = mongoose.model('task', TaskSchema);
