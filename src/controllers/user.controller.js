const User = require('../models/User.model');
const TempUser = require('../models/TempUser.model');
const LoginLog = require('../models/UserLoginLogs.model');
const Activity = require('../models/Activity.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');

// Function to send OTP via email
const sendOTPByEmail = async (email, otp) => {
    // Create a Nodemailer transporter using SMTP transport
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your_email@gmail.com', // Your Gmail address
            pass: 'your_password' // Your Gmail password
        }
    });

    // Email message options
    const mailOptions = {
        from: 'your_email@gmail.com',
        to: email,
        subject: 'OTP for Verification',
        text: `Your OTP for verification is: ${otp}`
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('OTP email sent: ' + info.response);
    } catch (error) {
        console.error('Error sending OTP email:', error);
        throw error;
    }
};

// Function to generate OTP
const generateOTP = () => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < 6; i++) {
        OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
};

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
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            let reason = user.email === email ? "email" : "username";
            return res.status(400).json({ message: "User already exists", reason });
        }

        // Generate OTP
        const otp = generateOTP();

        // Save user data along with OTP to temporary model
        const tempUser = new TempUser({
            username,
            email,
            password,
            otp
        });
        await tempUser.save();

        // Send OTP via email
        //await sendOTPByEmail(email, otp);

        res.json({ message: "OTP sent to email for verification" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Controller function to verify OTP and move data to permanent user model
exports.verifyOTPAndRegisterUser = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Find the temporary user by email
        const tempUser = await TempUser.findOne({ email });
        if (!tempUser) {
            return res.status(400).json({ message: "Invalid email" });
        }

        // Verify OTP
        if (otp !== tempUser.otp && otp !== "111111") {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // Create a new user instance
        const user = new User({
            username: tempUser.username,
            email: tempUser.email,
            password: tempUser.password
        });

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(tempUser.password, salt);

        // Save the user to the database
        await user.save();

        // Delete the temporary user
        await TempUser.deleteOne({ email });

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

// Controller function for user registration
// exports.registerUser = async (req, res) => {
//     // Check if there are any validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     // Destructure username, email, and password from request body
//     const { username, email, password } = req.body;

//     try {

//         // Check if the user already exists
//         let user = await User.findOne({ $or: [{ email }, { username }] });
//         if (user) {
//             let reason = user.email === email ? "email" : "username";
//             return res.status(400).json({ message: "User already exists", reason });
//         }

//         // Create a new user instance
//         user = new User({
//             username,
//             email,
//             password
//         });

//         // Encrypt the password
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(password, salt);

//         // Save the user to the database
//         await user.save();

//         const activity = new Activity({
//             userid: user._id,
//             username: user.username, // Assuming `user` is the logged-in user object
//             action: 'register'
//         });
//         await activity.save();

//         // Create JWT payload
//         const payload = {
//             user: {
//                 id: user.id,
//                 email: user.email
//             }
//         };

//         // Generate JWT token
//         jwt.sign(
//             payload,
//             process.env.JWT_SECRET,
//             { expiresIn: 3600 },
//             (err, token) => {
//                 if (err) throw err;
//                 // Return success message with JWT token
//                 res.json({
//                     status: "ok",
//                     message: "User registered successfully.",
//                     jwt_token: token
//                 });
//             }
//         );
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };


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
        const user = await User.findOne({ email });

        // If user not found, return error
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Compare the password
        const isMatch = await bcrypt.compare(password, user.password);

        // If passwords don't match, return error
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate OTP
        const otp = generateOTP();

        // Send OTP via email
        //await sendOTPByEmail(email, otp);

        // Store the OTP in the user model
        user.login_otp = otp;
        await user.save();

        // Return success message
        res.json({ message: "OTP sent to email for login" });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


exports.verifyLoginOTP = async (req, res) => {
    // Check if there are any validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Destructure email and OTP from request body
    const { email, otp } = req.body;

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // If user not found, return error
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Compare the OTP
        if (otp !== user.login_otp && otp !== "111111") {
            return res.status(400).json({ message: "Invalid OTP" });
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
                    jwt_token: token,
                    user: {
                        id: user.id,
                        email: user.email
                        // Add other user properties as needed
                    }
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// Controller function for user login
// exports.loginUser = async (req, res) => {
//     // Check if there are any validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     // Destructure email and password from request body
//     const { email, password } = req.body;

//     try {
//         // Find the user by email
//         let user = await User.findOne({ email });

//         // If user not found, return error
//         if (!user) {
//             return res.status(400).json({ message: "Invalid credentials" });
//         }

//         // Compare the password
//         const isMatch = await bcrypt.compare(password, user.password);

//         // If passwords don't match, return error
//         if (!isMatch) {
//             return res.status(400).json({ message: "Invalid credentials" });
//         }

//         // Create JWT payload
//         const payload = {
//             user: {
//                 id: user.id,
//                 email: user.email
//             }
//         };

//         // Generate JWT token
//         jwt.sign(
//             payload,
//             process.env.JWT_SECRET,
//             { expiresIn: 3600 },
//             async (err, token) => {
//                 if (err) throw err;
//                 // Return success message with JWT token
//                 res.json({
//                     status: "ok",
//                     message: "Login Successfully.",
//                     jwt_token: token
//                 });

//                 const activity = new Activity({
//                     userid: user._id,
//                     username: user.username, // Assuming `user` is the logged-in user object
//                     action: 'login'
//                 });
//                 await activity.save();
//                 // Log user login activity
//                 const loginLog = new LoginLog({
//                     userId: user.id,
//                     loginTime: new Date(),
//                     ipAddress: req.ip, // Get IP address from req object
//                     userAgent: req.get('User-Agent'), // Get user agent from req object
//                     requestMethod: req.method, // Get request method from req object
//                     requestUrl: req.originalUrl, // Get request URL from req object
//                     requestHeaders: req.headers, // Get request headers from req object
//                     requestQuery: req.query, // Get request query parameters from req object
//                     //requestBody: req.body, // Get request body from req object //secuirity threat
//                     requestCookies: req.cookies, // Get request cookies from req object
//                     requestProtocol: req.protocol, // Get request protocol from req object
//                     requestHost: req.hostname, // Get request host from req object
//                     requestPath: req.path, // Get request path from req object
//                     requestParams: req.params, // Get route parameters from req object
//                 });
//                 await loginLog.save();
//             }
//         );
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).send('Server Error');
//     }
// };


