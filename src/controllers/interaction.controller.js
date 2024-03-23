const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const Interaction = require('../models/interaction.model');

// Controller function to like a blog
exports.likeBlog = async (req, res) => {
    try {

        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });
        
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        // Create a new like interaction object
        const newLike = new Interaction({
            blogId: blogId,
            userId: req.user.id, // Assuming userId is obtained from the authenticated user
            type: 'like' // Indicate the interaction type as 'like'
        });

        // Save the new like interaction
        await newLike.save();

        res.status(201).json({ status: 'success', message: 'Blog liked successfully' });
    } catch (error) {
        console.error('Error liking blog:', error);
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
            userId: req.user.id, // Assuming userId is obtained from the authenticated user
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
            userId: req.user.id, // Assuming userId is obtained from the authenticated user
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
exports.getLikesForBlog = async (req, res) => {
    const blogId = req.params.id;
    try {
        const likes = await Interaction.find({ blogId, type: 'like' });
        res.status(200).json({ status: 'success', data: likes });
    } catch (error) {
        console.error('Error fetching likes for blog:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

