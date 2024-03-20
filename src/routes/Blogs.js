const express = require('express');
const router = express.Router();
const multer = require('multer');
const fileUpload = require('express-fileupload');
const upload = multer({ dest: 'uploads/' });
const Joi = require('joi');
const fs = require('fs');


const UserBlog = require('../models/Blogs.model');

// Middleware for file upload
router.use(fileUpload());

// Create a blog
router.post('/', async (req, res) => {
  try {
    // Extract data from the request body
    const { blogTitle, blogContent, blogCategory, blogStatus, userId } = req.body;

    // Validate the request data
    const schema = Joi.object({
      blogTitle: Joi.string().max(150).required(),
      blogContent: Joi.string().max(5000).required(),
      blogCategory: Joi.string().required(),
      blogStatus: Joi.string().valid('active', 'draft', 'deleted').required(),
      userId: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Validate the uploaded image
    if (!req.files || !req.files.blogImage) {
      return res.status(400).json({ error: 'Blog image is required.' });
    }

    const blogImage = req.files.blogImage;

    // Check file size
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (blogImage.size > maxSize) {
      return res.status(400).json({ error: 'Blog image size should not exceed 2MB.' });
    }

    // Check file type
    const allowedFileTypes = ['.png', '.jpg', '.jpeg'];
    const fileExtension = '.' + blogImage.name.split('.').pop().toLowerCase();
    if (!allowedFileTypes.includes(fileExtension)) {
      return res.status(400).json({ error: 'Blog image should be in PNG, JPG, or JPEG format.' });
    }

    // Move the uploaded image to a designated directory
    const uploadPath = 'uploads/';
    const fileName = 'blog_' + Date.now() + fileExtension;
    blogImage.mv(uploadPath + fileName);

    // Create the blog in the database
    const blog = await UserBlog.create({
      blogTitle,
      blogImage: fileName,
      blogContent,
      blogCategory,
      blogStatus,
      userId,
      lastUpdated: new Date(),
    });

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while creating the blog.' });
  }
});

// Read all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await UserBlog.find();
    res.json(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the blogs.' });
  }
});

// Read a specific blog
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await UserBlog.findById(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found.' });
    }

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while retrieving the blog.' });
  }
});

// Update a blog
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, blogTitle, blogContent, blogCategory, blogStatus } = req.body;

    // Check if the user has the privilege to edit the blog
    const blog = await UserBlog.findOne({
      _id: id,
      userId,
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or you do not have permission to edit it.' });
    }

    // Validate the request data
    const schema = Joi.object({
      blogTitle: Joi.string().max(150).required(),
      blogContent: Joi.string().max(5000).required(),
      blogCategory: Joi.string().required(),
      blogStatus: Joi.string().valid('active', 'draft', 'deleted').required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Update the blog
    blog.blogTitle = blogTitle;
    blog.blogContent = blogContent;
    blog.blogCategory = blogCategory;
    blog.blogStatus = blogStatus;
    blog.lastUpdated = new Date();

    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the blog.' });
  }
});

// Delete a blog
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Check if the user has the privilege to delete the blog
    const blog = await UserBlog.findOne({
      _id: id,
      userId,
    });

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found or you do not have permission to delete it.' });
    }

    await blog.deleteOne();

    res.json({ message: 'Blog deleted successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while deleting the blog.' });
  }
});

module.exports = router;
