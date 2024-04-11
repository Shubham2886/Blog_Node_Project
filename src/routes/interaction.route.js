const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interaction.controller');
const verifyToken = require('../middlewares/user_auth');

// Like a blog
router.post('/blogs/:id/like', verifyToken, interactionController.likeBlog);

//check like or not by user 
router.get('/blogs/:id/like', verifyToken, interactionController.checkLikedBlog);

// Share a blog
router.post('/blogs/:id/share', verifyToken, interactionController.shareBlog);

// Bookmark a blog
router.post('/blogs/:id/bookmark', verifyToken, interactionController.bookmarkBlog);

// Route to get all bookmarked blogs for a user
router.get('/bookmarked-blogs', verifyToken, interactionController.getBookmarkBlog);



// Route to get likes for a blog
router.get('/blogs/:id/all-like',interactionController.getLikesCountForBlog);

module.exports = router;
