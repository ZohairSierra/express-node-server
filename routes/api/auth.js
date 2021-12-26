const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');

const auth = require('../../middleware/auth');

const _ = require('lodash');

const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxfa57cfd107544417942b6124c1251b7d.mailgun.org';
const mg = mailgun({apiKey: config.get('MAILGUN_APIKEY'), domain: DOMAIN});

// User Model 
const User = require('../../models/User');

// @route GET api/auth/user
// @desc GET user data
// @access Private
router.get('/user', auth, (req, res) => {
    User.findById(req.user.id)
        .select('-password')
        .then(user => res.json(user));
});

// @route POST api/auth 
// @desc Auth user 
// @access Public (Has to be public because we need this route to get the token and use it to access private route)
router.post('/', (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if(!email || !password) {
        return res.status(400).json({
            message: 'Please enter all fields!'
        });
    }

    // Check for existing user
    User.findOne({ email })
        .then(user => {
            if(!user) {
                return res.status(400).json({
                    message: 'User does not exist.'
                });
            }

            // Validate password
            bcrypt.compare(password, user.password)
                .then(isMatch => {
                    if(!isMatch) {
                        return res.status(400).json({
                            message: 'Invalid Credentials'
                        });
                    }
                    
                    // In case of a match, we need to send the token and the user, just like we do in Registration
                    jwt.sign(
                        { id: user.id },
                        config.get('jwtSecret'),
                        { expiresIn: 3600 },
                        (error, token) => {
                            if(error) throw error;
                            res.json({
                                token,
                                user: {
                                    id: user.id,
                                    name: user.name,
                                    email: user.email
                                },
                                message: "User successfully logged in."
                            });
                        }
                    )
                })
        });
});

// @route POST api/auth/forgot-password
// @desc Generate a forgot password link and send it to the specified email
// @access Public
router.post('/forgot-password', (req, res) => {
    console.log('req body', req.body);
    const { email } = req.body;

    User.findOne({ email }, (error, user) => {
        if(error || !user) {
            return res.status(400).json({
                message: 'User with this email does not exist.'
            });
        }
        console.log('req', req.hostname);
        const token = jwt.sign({id: user.id}, config.get('jwtSecret'), { expiresIn: 60*60*24 });
        let base_url = process.env.NODE_ENV == 'production' ? config.get('frontend_url.production') : config.get('frontend_url.development');
        let url = `${base_url}/reset-password/${token}`;
        const data = {
            from: 'verification@techsierra.in',
            to: email,
            subject: 'Reset Password Link',
            html: `
            <h2>Please click the below link to reset your password.</h2>
            <a href="${url}">${url}</a>
            `
        }

        return user.updateOne({ resetLink: token }, (error, success) => {
            if(error) {
                return res.status(400).json({
                    message: 'There was some issue in setting the reset link.'
                });
            } else {
                mg.messages().send(data, function (error, body) {
                    console.log('error', error);
                    console.log('body', body);
                    if(error && body.id) {
                        return res.status(400).json({
                            message: error.message
                        });
                    } else if(!body.id) {
                        return res.status(400).json({
                            message: 'Email not added to the email recipients list. Contact the administrator to get it added.'
                        })
                        // Case where the email is not added to the recipient list
                    } else {
                        return res.json({
                            message: "Email verification mail has been sent to the email. Click on the link provided to proceed."
                        })
                    }
                });
                
            }

        });
    });
});

// @route POST Reset Password
// @desc Verify the token and then reset the password to a new one specified
// @access Private
router.post('/reset-password', (req, res) => {
    const { resetLink, newPassword, confirmPassword } = req.body;
    if(resetLink) {
        //  Decode the token and verify if it has the same user id as user.resetLink 
        jwt.verify(resetLink, config.get('jwtSecret'), (error, decodedData) => {
            console.log('decoded data', decodedData);
            if(error) {
                return res.status(401).json({
                    message: 'Incorrect or expired token.'
                })
            } else {
                User.findOne({ resetLink }, (error, user) => {
                    if(error || !user) {
                        return res.status(400).json({
                            message: 'User with this token does not exist.'
                        });
                    }

                    // Required user found. Update the password with the new one.
                    if(newPassword !== confirmPassword) {
                        return res.status(400).json({
                            message: 'Both passwords do not match.'
                        });
                    }

                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newPassword, salt, (err, hash) => {
                            if(err) throw err;
                            const newHashedPassword = {
                                password: hash,
                                resetLink: ''
                            };

                            user = _.extend(user, newHashedPassword);
                            user.save((error, result) => {
                                if(error) {
                                    return res.status(400).json({
                                        message: "There was a problem in saving the new password. Please try again later." 
                                    })
                                } else {
                                    return res.json({
                                        message: "Your password has been updated successfully. Please login once again to continue."
                                    });
                                }
                            });
                        });
                    });
                });
            }
        });

    } else {
        return res.status(401).json({
            nessage: 'Reset link token not provided. Please try again later.'
        });
    }
});


module.exports = router;
