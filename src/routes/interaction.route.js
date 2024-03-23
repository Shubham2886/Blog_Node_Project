const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const verifyToken = require('../middlewares/user_auth');

// Like a blog
router.post('/blogs/:id/like', verifyToken, interactionController.likeBlog);

// Share a blog
router.post('/blogs/:id/share', verifyToken, interactionController.shareBlog);

// Bookmark a blog
router.post('/blogs/:id/bookmark', verifyToken, interactionController.bookmarkBlog);


// Route to get likes for a blog
router.get('/blogs/:id/like', interactionController.getLikesForBlog);

module.exports = router;
