const express = require('express');
const router = express.Router();
const authController = require('../controllers/user.controller');
//const authenticateToken = require('../middlewares/user_auth');

router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);

module.exports = router;
