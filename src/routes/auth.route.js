const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controller');
const profileController = require('../controllers/profile.controller');
//const verifyToken = require('../middlewares/user_auth');

router.post('/register', authController.registerUser);
router.post('/verify-register-otp', authController.verifyOTPAndRegisterUser);
router.post('/login', authController.loginUser);
router.post('/verify-login-otp', authController.verifyLoginOTP);




module.exports = router;
