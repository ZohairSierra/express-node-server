const express = require('express');

const router = express.Router();

// Task Model
const Task = require('../../models/Task');

// @route GET api/tasks
// @desc GET All tasks
// @access PUBLIC
router.get('/', (req, res) => {
    Task.find()
        .sort({ date: -1 })
        .then(tasks => res.json(tasks));
            // +1 in sort() means ascending and -1 means descending
            // .find(), .sort(), .then() are mongoose ORM methods to fetch MongoDB records
});

// @route POST api/tasks
// @desc Create a task 
// @access Public (Normally it's private but for now it's public)
router.post('/', (req, res) => {
    const newTask = new Task({
        text: req.body.text,
        day: req.body.day,
        reminder: req.body.reminder
    });
    // Using body parser allows us to get data from req.body.text 
    // Date is automatically inserted, so we don't need that

    newTask.save().then(task => res.json(task));
});

// @route EDIT api/tasks/:id 
// @desc Modify a task 
// @access Public (for now) 
router.post('/:id', (req, res) => {
    const oldTask = Task.findById(req.params.id);
    oldTask.update({
        ...oldTask,
        text: req.body.text,
        day: req.body.day,
        reminder: req.body.reminder
    }).save().then(task => res.json(task));
});

// @route DELETE api/tasks/:id
// @desc Delete an item
// @access Public (for now)
router.delete('/:id', (req, res) => {
    Task.findById(req.params.id)
        .then(task => task.remove().then(() => res.json({ success: true })))
        .catch(error => {
            console.log(`Error while deleting a task: ${error}`);
            res.status(404).json({ success: false })
        });
    // :id retrieves the id dynamically from the url
    // The req.params.id gets the id value from the url
    // catch block is if in case the task is not found, return 404 error
});

module.exports = router;