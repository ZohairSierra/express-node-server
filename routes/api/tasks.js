const express = require('express');

const router = express.Router();

// Task Model
const Task = require('../../models/Task');

const auth = require('../../middleware/auth');

// @route GET api/tasks
// @desc GET All tasks
// @access PUBLIC
router.get('/', auth, (req, res) => {
    Task.find({ user: req.user.id})
        .sort({ date: -1 })
        .then(tasks => {
            res.json(tasks);
        });
            // +1 in sort() means ascending and -1 means descending
            // .find(), .sort(), .then() are mongoose ORM methods to fetch MongoDB records
});

// @route POST api/tasks
// @desc Create a task 
// @access private
router.post('/', auth, (req, res) => {
    const newTask = new Task({
        text: req.body.text,
        day: req.body.day,
        reminder: req.body.reminder,
        user: req.user.id
    });
    // Using body parser allows us to get data from req.body.text 
    // Date is automatically inserted, so we don't need that

    newTask.save().then(task => res.json({
        task: task,
        message: 'Task has been created successfully.'
    }));
});

// @route EDIT api/tasks/:id 
// @desc Modify a task 
// @access private
router.put('/:id', auth, (req, res) => {
    Task.findByIdAndUpdate(req.params.id, {
        text: req.body.text,
        day: req.body.day,
        reminder: req.body.reminder
    }, (error, task) => {
        if(error) {
            res.status(401).json({
                message: 'There was some error updating the task.'
            });
            console.log(`Error updating model: ${error}`);
        }
        else {
            res.json({
                task: task,
                message: 'Task has been modified successfully!'
            });
        }
    });
});

// @route DELETE api/tasks/:id
// @desc Delete an item
// @access private
router.delete('/:id', auth, (req, res) => {
    Task.findById(req.params.id)
        .then(task => task.remove().then(() => res.json({ success: true, message: 'Task has been deleted successfully.'})))
        .catch(error => {
            console.log(`Error while deleting a task: ${error}`);
            res.status(404).json({ success: false, message: 'Task could not be deleted successfully.'})
        });
    // :id retrieves the id dynamically from the url
    // The req.params.id gets the id value from the url
    // catch block is if in case the task is not found, return 404 error
});

module.exports = router;