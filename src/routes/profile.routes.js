const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');
const verifyToken = require('../middlewares/user_auth');


// Profile routes
router.get('/profile', verifyToken, profileController.getUserProfile);
router.patch('/profile', verifyToken, profileController.updateUserProfile);
router.delete('/profile', verifyToken, profileController.deleteUserProfile);
router.get('/profile/blogs', verifyToken, profileController.getUserBlogs);
router.get('/profile/activity', verifyToken, profileController.getUserActivity);

module.exports = router;