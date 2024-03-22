const mongoose = require('mongoose');
const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Specify the destination directory where the uploaded files will be stored
    },
    filename: function (req, file, cb) {
        // Generate unique filename by appending timestamp to the original filename
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Multer file filter to restrict file types (optional)
const fileFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // Accept the file
    } else {
        cb(new Error('Only images are allowed')); // Reject the file
    }
};

// Multer upload configuration
const upload = multer({ storage: storage, fileFilter: fileFilter });

exports.createBlog = async (req, res) => {
    try {
        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        const userId = res.locals.userPayload.user.id;

        // Handle file upload using multer middleware
        upload.single('blogimage')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ error: 'File upload error' });
            } else if (err) {
                // An unknown error occurred when uploading
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Access fields from req.body
            const { blogtitle, blogcategory, blogstatus, blogcontent } = req.body;

            // File uploaded successfully, retrieve file path
            const blogimage = req.file.path;

            // Create a new blog post
            const newBlog = new Blog({
                blogtitle,
                blogimage,
                blogcontent,
                blogcategory,
                blogstatus,
                userid: userId
            });

            // Save the new blog post to the database
            await newBlog.save();

            // Respond with success message
            res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
        });

    } catch (error) {
        // Handle errors
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Controller function to update an existing blog
exports.updateBlog = async (req, res) => {
    try {
        // Retrieve the blog ID from the request parameters
        const blogId = req.params.id;

        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });


        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Use the upload middleware for handling file uploads
        upload.single('blogimage')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ error: 'File upload error' });
            } else if (err) {
                // An unknown error occurred when uploading
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // File uploaded successfully, retrieve file path
            const blogimage = req.file.path;

            // Extract updated data from the request body
            const { blogtitle, blogcategory, blogcontent, blogstatus } = req.body;

            // Update the blog fields
            if (blogtitle) blog.blogtitle = blogtitle;
            if (blogcategory) blog.blogcategory = blogcategory;
            if (blogcontent) blog.blogcontent = blogcontent;
            if (blogstatus) blog.blogstatus = blogstatus;

            // Save the updated blog
            await blog.save();

            // Respond with success message and updated blog data
            res.status(200).json({ message: 'Blog updated successfully', blog });
        });
    } catch (error) {
        // Handle errors
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to delete an existing blog
exports.deleteBlog = async (req, res) => {
    try {
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the currently authenticated user matches the userid of the blog
        const userId = res.locals.userPayload.user.id;
        if (blog.userid !== userId) {
            return res.status(403).json({ message: 'Unauthorized: You do not have permission to delete this blog' });
        }

        // Delete the blog
        await Blog.findByIdAndDelete(blogId);

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

// Controller function to get all blogs
exports.getAllBlogs = async (req, res) => {
    try {
        // Get all blogs
        const blogs = await Blog.find();

        // Get the total number of blogs
        const totalBlogs = blogs.length;

        // Check if any blogs exist
        if (totalBlogs === 0) {
            return res.status(404).json({ status: 'error', message: 'No blogs found' });
        }

        // Return the blogs along with the total count
        return res.status(200).json({ status: 'success', message: 'Blogs found', totalBlogs, blogs });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Controller function to get a single blog by ID
exports.getBlogById = async (req, res) => {
    try {
        const { id } = req.params;

        // Find the blog by ID
        const blog = await Blog.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ status: 'error', message: 'Blog not found' });
        }

        // Return the blog if found
        return res.status(200).json({ status: 'success', message: 'Blog found', blog });
    } catch (error) {
        console.error('Error fetching blog by ID:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Controller function to get blogs associated with the currently authenticated user
exports.getUserBlogs = async (req, res) => {
    try {

        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Extract the user ID from the request object (assuming it's stored in req.user)
        const userId = res.locals.userPayload.user.id;

        // Retrieve blogs associated with the user ID
        const userBlogs = await Blog.find({ userid: userId });

         // Get the total number of user's blogs
         const totalUserBlogs = userBlogs.length;

        // Check if any blogs were found
        if (!userBlogs || userBlogs.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No blogs found for the user' });
        }

        // Return the user's blogs
        return res.status(200).json({ status: 'success', message: 'User blogs found', totalUserBlogs, userBlogs });
    } catch (error) {
        console.error('Error fetching user blogs:', error);
        return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};