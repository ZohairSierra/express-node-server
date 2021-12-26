const config = require('config');
const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const token = req.header(`x-auth-token`);

    // Check for token
    if(!token) {
        res.status(401).json({
            message: 'No token, authorization denied.'
        });
    }

    try {
        // Verify token 
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        // Add user from payload
        req.user = decoded;
        next();
    } catch(error) {
        res.status(400).json({
            message: 'Token invalid.'
        });
    }
}

module.exports = auth;