require("dotenv").config();
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Get the authorization header from the request
    const authHeader = req.headers['authorization'];
    // Retrieve the token from the authorization header
    const token = authHeader && authHeader.split(' ')[1];

    // If no token is provided, return an unauthorized error
    if (!token) {
        return res.status(401).json({ error: 'Access token not provided' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
            // If token verification fails, return an unauthorized error
            return res.status(403).json({ error: 'Invalid access token' });
        }

        // If token is valid, attach the decoded token to the request for further processing
        req.decodedToken = decodedToken;
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = authenticateToken;
