const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const verifyToken = require('../middlewares/user_auth');

router.post('/createBlog', verifyToken, blogController.createBlog);
router.patch('/updateBlog/:blogId', verifyToken, blogController.updateBlog);
router.patch('/updateImage/:blogId', verifyToken, blogController.updateImage);
router.delete('/deleteBlog/:id', verifyToken, blogController.deleteBlog);
router.get('/getAllBlogs', blogController.getAllBlogs);
router.get('/getBlogById/:id', blogController.getBlogById);
router.get('/getUserBlog', verifyToken,blogController.getUserBlogs);


module.exports = router;