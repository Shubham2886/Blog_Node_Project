const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const Interaction = require('../models/Interaction.model');

// Controller function to like a blog
exports.likeBlog = async (req, res) => {
    try {

        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        const blogId = req.params.id;
        // Check if the blog exists
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ status: 'error', message: 'Blog not found.' });
        }
        // Check if the user has already liked the blog
        const existingLike = await Interaction.findOne({ blogId, userId: res.locals.userPayload.user.id, type: 'like' });
        if (existingLike) {
            return res.status(400).json({ status: 'error', message: 'You have already liked this blog.' });
        }
        // Create a new like interaction object
        const newLike = new Interaction({
            blogId,
            userId: res.locals.userPayload.user.id,
            type: 'like'
        });
        // Save the new like interaction
        await newLike.save();
        
        res.status(201).json({ status: 'success', message: 'Blog liked successfully' });
    } catch (error) {
        console.error('Error liking blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

//check like blog
exports.checkLikedBlog = async (req, res) => {
    try {
        // Get the user ID from the authenticated user
        const userId = res.locals.userPayload.user.id;

        // Get the blog ID from the request parameters
        const blogId = req.params.id;

        // Check if the user has liked the specified blog
        const existingLike = await Interaction.findOne({ blogId, userId, type: 'like' });

        // Return whether the user has liked the blog or not
        res.status(200).json({ liked: !!existingLike });
    } catch (error) {
        console.error('Error checking liked blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};


// Controller function to share a blog
exports.shareBlog = async (req, res) => {
    try {
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        // Create a new share interaction object
        const newShare = new Interaction({
            blogId: blogId,
            userId: res.locals.userPayload.user.id, // Assuming userId is obtained from the authenticated user
            type: 'share' // Indicate the interaction type as 'share'
        });

        // Save the new share interaction
        await newShare.save();

        res.status(201).json({ status: 'success', message: 'Blog shared successfully' });
    } catch (error) {
        console.error('Error sharing blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Controller function to bookmark a blog
exports.bookmarkBlog = async (req, res) => {
    try {
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        // Create a new bookmark interaction object
        const newBookmark = new Interaction({
            blogId: blogId,
            userId: res.locals.userPayload.user.id, // Assuming userId is obtained from the authenticated user
            type: 'bookmark' // Indicate the interaction type as 'bookmark'
        });

        // Save the new bookmark interaction
        await newBookmark.save();

        res.status(201).json({ status: 'success', message: 'Blog bookmarked successfully' });
    } catch (error) {
        console.error('Error bookmarking blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Function to get likes for a blog
exports.getLikesCountForBlog = async (req, res) => {
    const blogId = req.params.id;
    try {
        const likes = await Interaction.find({ blogId, type: 'like' });
        const likesCount = likes.length; // Get the count of likes
        res.status(200).json({ status: 'success', likesCount });
    } catch (error) {
        console.error('Error fetching likes count for blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

