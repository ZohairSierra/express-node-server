const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

// User Model 
const User = require('../../models/User');

// @route GET api/users
// @desc Get all users
// @access Public (for now) 
router.get('/', (req, res) => {
    User.find()
        .sort({ date: -1 })
        .then(users => {
            res.json(users);
        }).catch(error => res.json({
            message: error
        }));
});

// @route DELETE api/users
// @desc Delete a user
// @access Public (for now)
router.delete('/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => user.remove().then(() => res.json({ success: true })))
        .catch(error => {
            console.log(`Error while deleting a user: ${error}`);
            res.status(404).json({ success: false });
        });
});

// @route/POST api/users
// @desc Register new user
// @access Public 
router.post('/', (req, res) => {
    const {
        name,
        email,
        password
    } = req.body;

    // Simple validation
    if(!name || !email || !password) {
        return res.status(400).json({
            message: 'Please enter all fields'
        })
    }

    // Check for existing user
    User.findOne({ email })
        .then(user => {
            // If user does not exist, it will be null
            if(user) {
                return res.status(400).json({
                    message: 'User already exists.'
                });
            }
            const newUser = new User({
                name,
                email,
                password
            });

            // Now we will generate a salt, which is used to create a hash, password hash from a plaintext password which we want to put in the database

            // Create a salt and a hash
            bcrypt.genSalt(10, (err, salt) => {
                if(err) throw err;
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if(err) throw err;
                    newUser.password = hash;
                    newUser.save()
                        .then(user => {
                            jwt.sign(
                                // First parameter is a payload, we can add anything here
                                {id: user.id},
                                // When we get this token from postman or application API, by including the id we know which user this is
                                // Otherwise any token can access anything. So we want to make sure to send the ID, verify it and then do other stuff

                                // Second parameter is the jwtSecret
                                config.get('jwtSecret'),

                                // Lastly we have a callback
                                (error, token) => {
                                    if(error) throw error;
                                    res.json({
                                        token,
                                        user: {
                                            id: user.id,
                                            name: user.name,
                                            email: user.email
                                        },
                                        message: 'User created successfully. Please login to continue...'
                                    });
                                }
                            );
                        }).catch(error => console.log(`Error while creating a new user: ${error}`));
                });
            });
        });
});

module.exports = router;