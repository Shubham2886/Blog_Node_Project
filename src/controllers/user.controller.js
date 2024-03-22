const User = require('../models/User.model');
const LoginLog = require('../models/UserLoginLogs.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Controller function for user registration
exports.registerUser = async (req, res) => {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure username, email, and password from request body
    const { username, email, password } = req.body;

    try {
        // Check if the user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Create a new user instance
        user = new User({
            username,
            email,
            password
        });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Save the user to the database
        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        // Generate JWT token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if (err) throw err;
                // Return success message with JWT token
                res.json({
                    status: "ok",
                    message: "User registered successfully.",
                    jwt_token: token
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Controller function for user login
exports.loginUser = async (req, res) => {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure email and password from request body
    const { email, password } = req.body;

    try {
        // Find the user by email
        let user = await User.findOne({ email });

        // If user not found, return error
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match, return error
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.id,
                email: user.email
            }
        };

        // Generate JWT token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 3600 },
            async (err, token) => {
                if (err) throw err;
                // Return success message with JWT token
                res.json({
                    status: "ok",
                    message: "Login Successfully.",
                    jwt_token: token
                });

                // Log user login activity
                const loginLog = new LoginLog({
                    userId: user.id,
                    loginTime: new Date(),
                    ipAddress: req.ip, // Get IP address from req object
                    userAgent: req.get('User-Agent'), // Get user agent from req object
                    requestMethod: req.method, // Get request method from req object
                    requestUrl: req.originalUrl, // Get request URL from req object
                    requestHeaders: req.headers, // Get request headers from req object
                    requestQuery: req.query, // Get request query parameters from req object
                    //requestBody: req.body, // Get request body from req object //secuirity threat
                    requestCookies: req.cookies, // Get request cookies from req object
                    requestProtocol: req.protocol, // Get request protocol from req object
                    requestHost: req.hostname, // Get request host from req object
                    requestPath: req.path, // Get request path from req object
                    requestParams: req.params, // Get route parameters from req object
                });
                await loginLog.save();
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};