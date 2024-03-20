const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const authenticateToken = require('../middlewares/user_auth');

router.post('/', authenticateToken, blogController.createBlog);
router.patch('/:id', authenticateToken, blogController.updateBlog);
router.delete('/:id', authenticateToken, blogController.deleteBlog);
router.get('/', blogController.getAllBlogs);
router.get('/:id', blogController.getBlogById);

module.exports = router;
