const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');
const verifyToken = require('../middlewares/user_auth');

// Add a comment to a blog
router.post('/blogs/:id/comments', verifyToken, commentController.addComment);

// Update a comment on a blog
router.patch('/blogs/:id/comments/:comment_id', verifyToken, commentController.updateComment);

// Delete a comment from a blog
router.delete('/blogs/:id/comments/:comment_id', verifyToken, commentController.deleteComment);

// Get all comments for a particular blog
router.get('/blogs/:blogId/comments', verifyToken, commentController.getAllCommentsForBlog);



module.exports = router;
