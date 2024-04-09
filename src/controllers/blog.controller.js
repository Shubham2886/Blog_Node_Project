const mongoose = require('mongoose');
const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const Activity = require('../models/Activity.model');
const multer = require('multer');
const path = require('path');
const S3Client = require('../s3'); // Adjust the path as necessary

//new s3 bucket
// Initialize Multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // Limit file size to 5MB
    }
});
// const storage = multer.memoryStorage(); // Use memory storage
// const upload = multer({ storage: storage });


exports.createBlog = async (req, res) => {
    try {
        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        const userId = res.locals.userPayload.user.id;
        // Use the upload middleware for handling file uploads
        upload.single('blogimage')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ error: 'File upload error' });
            } else if (err) {
                // An unknown error occurred when uploading
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log(req.file);
            // File uploaded successfully, now upload to S3
            const file = req.file;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET, // Replace with your bucket name
                Key: file.originalname, // Use the original file name
                Body: file.buffer, // The file buffer
                //ACL: 'public-read' // Set the file to be publicly readable
            };

            try {
                const data = await S3Client.uploadImage(params);
                const blogimage = data.Location; // The URL of the uploaded image

                // Extract updated data from the request body
                const { blogtitle, blogcategory, blogcontent, blogstatus } = req.body;

                // Create a new blog post
                const newBlog = new Blog({
                    blogtitle,
                    blogimage,
                    blogcontent,
                    blogcategory,
                    blogstatus,
                    userid: userId
                });

                const activity = new Activity({
                    userid: user._id, // Assuming `user` is the logged-in user object
                    username: user.username,
                    action: 'blog_create'
                });
                await activity.save();

                // Save the new blog post to the database
                await newBlog.save();

                // Respond with success message
                res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
            } catch (uploadError) {
                console.error('Error uploading image to S3:', uploadError);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });

    } catch (error) {
        // Handle errors
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//old create blog code
// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Specify the destination directory where the uploaded files will be stored
//     },
//     filename: function (req, file, cb) {
//         // Generate unique filename by appending timestamp to the original filename
//         cb(null, Date.now() + path.extname(file.originalname));
//     }
// });

// // Multer file filter to restrict file types (optional)
// const fileFilter = (req, file, cb) => {
//     // Check file type
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true); // Accept the file
//     } else {
//         cb(new Error('Only images are allowed')); // Reject the file
//     }
// };

// // Multer upload configuration
// const upload = multer({ storage: storage, fileFilter: fileFilter });
// exports.createBlog = async (req, res) => {
//     try {
//         // Perform user existence check
//         const user = await User.findById(res.locals.userPayload.user.id);
//         if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

//         const userId = res.locals.userPayload.user.id;
//         // Use the upload middleware for handling file uploads
//         upload.single('blogimage')(req, res, async function (err) {
//             if (err instanceof multer.MulterError) {
//                 // A Multer error occurred when uploading
//                 return res.status(400).json({ error: 'File upload error' });
//             } else if (err) {
//                 // An unknown error occurred when uploading
//                 return res.status(500).json({ error: 'Internal Server Error' });
//             }

//             console.log(req.file);
//             // File uploaded successfully, retrieve file path
//             const blogimage = req.file ? req.file.path : null;

//             // Extract updated data from the request body
//             const { blogtitle, blogcategory, blogcontent, blogstatus } = req.body;

//             // Create a new blog post
//             const newBlog = new Blog({
//                 blogtitle,
//                 blogimage,
//                 blogcontent,
//                 blogcategory,
//                 blogstatus,
//                 userid: userId
//             });

//             const activity = new Activity({
//                 userid: user._id, // Assuming `user` is the logged-in user object
//                 username: user.username,
//                 action: 'blog_create'
//             });
//             await activity.save();

//             // Save the new blog post to the database
//             await newBlog.save();

//             // Respond with success message
//             res.status(201).json({ message: 'Blog created successfully', blog: newBlog });
//         });

//     } catch (error) {
//         // Handle errors
//         console.error('Error creating blog:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

//new code to update blog s3
// Controller function to update an existing blog with S3 enabled
// Function to update a blog post
exports.updateBlog = async (req, res) => {
    try {
        // Retrieve the blog ID from the request parameters
        const blogId = req.params.blogId;

        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Check if the blog exists
        const existingBlog = await Blog.findById(blogId);
        if (!existingBlog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Extract updated data from the request body
        const { blogtitle, blogcategory, blogcontent, blogstatus } = req.body;

        // Update the blog post
        existingBlog.blogtitle = blogtitle;
        existingBlog.blogcategory = blogcategory;
        existingBlog.blogcontent = blogcontent;
        existingBlog.blogstatus = blogstatus;

        await existingBlog.save();

        // Respond with success message
        res.status(200).json({ message: 'Blog updated successfully', blog: existingBlog });
    } catch (error) {
        // Handle errors
        console.error('Error updating blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


// Export function to update image of blog post
// Function to update an image in S3 bucket
exports.updateImage = async (req, res) => {
    try {
        const { blogId } = req.params; // Retrieve the blog ID from the request parameters

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        // Retrieve the existing image URL from the database
        const existingImageURL = blog.blogimage;
        console.log('existing imageurl:', existingImageURL);

        //Use the upload middleware for handling file uploads
        upload.single('blogimage')(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                // A Multer error occurred when uploading
                return res.status(400).json({ error: 'File upload error' });
            } else if (err) {
                // An unknown error occurred when uploading
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            console.log(req.file);
            // File uploaded successfully, now upload to S3
            const file = req.file;
            const params = {
                Bucket: process.env.AWS_S3_BUCKET, // Replace with your bucket name
                Key: file.originalname, // Use the original file name
                Body: file.buffer, // The file buffer
                //ACL: 'public-read' // Set the file to be publicly readable
            };

            try {
                const data = await S3Client.uploadImage(params);
                const imageURL = data.Location; // The URL of the updated image

                // Update the blog's image URL
                blog.blogimage = imageURL;
                await blog.save();


                // Delete the existing image from S3
                const deleteParams = {
                    Bucket: process.env.AWS_S3_BUCKET, // Your bucket name
                    Key: existingImageURL.split('amazonaws.com/')[1] // Extract the key from the existing image URL
                };

                await S3Client.deleteImage(deleteParams);

                //await S3Client.deleteImage(existingImageURL);

                // Respond with success message
                res.status(200).json({ message: 'Image updated successfully', imageURL });
            } catch (uploadError) {
                console.error('Error uploading image to S3:', uploadError);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });

    } catch (error) {
        // Handle errors
        console.error('Error updating image:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};









//old code 
// Controller function to update an existing blog
// exports.updateBlog = async (req, res) => {
//     try {
//         // Retrieve the blog ID from the request parameters
//         const blogId = req.params.id;

//         const user = await User.findById(res.locals.userPayload.user.id);
//         if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

//         // Check if the blog exists
//         const blog = await Blog.findById(blogId);
//         if (!blog) {
//             return res.status(404).json({ message: 'Blog not found' });
//         }

//         // Use the upload middleware for handling file uploads
//         upload.single('blogimage')(req, res, async function (err) {
//             if (err instanceof multer.MulterError) {
//                 // A Multer error occurred when uploading
//                 return res.status(400).json({ error: 'File upload error' });
//             } else if (err) {
//                 // An unknown error occurred when uploading
//                 return res.status(500).json({ error: 'Internal Server Error' });
//             }

//             // File uploaded successfully, retrieve file path
//             const blogimage = req.file ? req.file.path : null;


//             // Extract updated data from the request body
//             const { blogtitle, blogcategory, blogcontent, blogstatus } = req.body;

//             // Update the blog fields if they are provided in the request
//             if (blogtitle) blog.blogtitle = blogtitle;
//             if (blogcategory) blog.blogcategory = blogcategory;
//             if (blogcontent) blog.blogcontent = blogcontent;
//             if (blogstatus) blog.blogstatus = blogstatus;
//             if (blogimage) blog.blogimage = blogimage;

//             const activity = new Activity({
//                 userid: user._id,
//                 username: user.username, // Assuming `user` is the logged-in user object
//                 action: 'blog_update'
//             });
//             await activity.save();

//             console.log(blog);
//             // Save the updated blog
//             await blog.save();

//             // Respond with success message and updated blog data
//             res.status(200).json({ message: 'Blog updated successfully', blog });
//         });
//     } catch (error) {
//         // Handle errors
//         console.error('Error updating blog:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };


//new delete blog code with s3 enabled 
exports.deleteBlog = async (req, res) => {
    try {
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        const user = await User.findById(res.locals.userPayload.user.id);

        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        console.log(blog);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if the currently authenticated user matches the userid of the blog
        const userId = res.locals.userPayload.user.id;
        if (blog.userid.toString() !== userId) {
            return res.status(403).json({ message: 'Unauthorized: You do not have permission to delete this blog' });
        }

          // Retrieve the existing image URL from the database
          const existingImageURL = blog.blogimage;
          console.log('existing imageurl:', existingImageURL);
        

        const activity = new Activity({
            userid: user._id,
            username: user.username, // Assuming `user` is the logged-in user object
            action: 'blog_delete'
        });
        await activity.save();

        // Delete the blog's image from S3
        // Assuming the blog object has a property `blogimage` that contains the image URL
        // Delete the existing image from S3
        const deleteParams = {
            Bucket: process.env.AWS_S3_BUCKET, // Your bucket name
            Key: existingImageURL.split('amazonaws.com/')[1] // Extract the key from the existing image URL
        };
        const result = await S3Client.deleteImage(deleteParams);
        // Delete the blog
        await Blog.findByIdAndDelete(blogId);

        res.status(200).json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};


//old delete blog code 
// Controller function to delete an existing blog
// exports.deleteBlog = async (req, res) => {
//     try {
//         // Extract the blog ID from the request parameters
//         const blogId = req.params.id;

//         const user = await User.findById(res.locals.userPayload.user.id);

//         // Check if the blog exists
//         const blog = await Blog.findById(blogId);
//         if (!blog) {
//             return res.status(404).json({ message: 'Blog not found' });
//         }

//         // Check if the currently authenticated user matches the userid of the blog
//         const userId = res.locals.userPayload.user.id;
//         if (blog.userid !== userId) {
//             return res.status(403).json({ message: 'Unauthorized: You do not have permission to delete this blog' });
//         }

//         const activity = new Activity({
//             userid: user._id,
//             username: user.username, // Assuming `user` is the logged-in user object
//             action: 'blog_delete'
//         });
//         await activity.save();

//         // Delete the blog
//         await Blog.findByIdAndDelete(blogId);

//         res.status(200).json({ message: 'Blog deleted successfully' });
//     } catch (error) {
//         console.error('Error deleting blog:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// };

// Controller function to get all blogs with pagination, search filters, and sorting
exports.getAllBlogs = async (req, res) => {
    try {
        // Pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Search filters
        const { blogtitle, blogcategory } = req.query;
        const filter = {};

        if (blogtitle) {
            filter.blogtitle = { $regex: blogtitle, $options: 'i' }; // Case-insensitive search
        }

        if (blogcategory) {
            filter.blogcategory = { $regex: blogcategory, $options: 'i' }; // Case-insensitive search
        }

        // Sorting parameters
        const { sortField, sortOrder } = req.query;
        const sortOptions = {};

        if (sortField && sortOrder) {
            sortOptions[sortField] = sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default sorting by lastupdated field in descending order if not provided
            sortOptions.lastupdated = -1;
        }

        // Query to fetch blogs with pagination, search filters, and sorting
        const blogs = await Blog.find(filter)
            .skip((page - 1) * limit)
            .limit(limit)
            .sort(sortOptions)
            .populate('userid', 'username');

        // Get the total number of blogs matching the search filters
        const totalBlogs = await Blog.countDocuments(filter);

        // Check if any blogs exist
        if (totalBlogs === 0) {
            return res.status(404).json({ status: 'error', message: 'No blogs found' });
        }

        // Return the paginated, filtered, and sorted blogs along with the total count
        return res.status(200).json({
            status: 'success',
            message: 'Blogs found',
            totalBlogs,
            totalPages: Math.ceil(totalBlogs / limit),
            currentPage: page,
            blogs
        });
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