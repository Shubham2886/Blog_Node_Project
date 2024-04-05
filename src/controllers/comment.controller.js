const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const Comment = require('../models/Comment.model');
const Activity = require('../models/Activity.model');

// Controller function to add a comment to a blog
exports.addComment = async (req, res) => {
    try {
        console.log(req.body.content);
        // Extract the blog ID from the request parameters
        const blogId = req.params.id;

        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Create a new comment object
        const newComment = new Comment({
            blogId: blogId,
            userId: user._id, // Assuming userId is obtained from the authenticated user
            content: req.body.content // Assuming the content is sent in the request body
        });
        const activity = new Activity({
            userid: user._id,
            username: user.username, // Assuming `user` is the logged-in user object
            blogid: blogId,
            action: 'blog_comment'
        });
        await activity.save();

        // Save the new comment
        await newComment.save();

        res.status(201).json({ status: 'success', message: 'Comment added successfully' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Controller function to update a comment on a blog
exports.updateComment = async (req, res) => {
    try {
        // Extract the blog ID and comment ID from the request parameters
        const { id: blogId, comment_id: commentId } = req.params;

        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Find the comment by ID and update its content
        const updatedComment = await Comment.findByIdAndUpdate(commentId, { content: req.body.content }, { new: true });

        if (!updatedComment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        const activity = new Activity({
            userid: user._id,
            username: user.username, // Assuming `user` is the logged-in user object
            blogid: blogId,
            commentid: commentId,
            action: 'blog_update_comment'
        });
        await activity.save();

        res.status(200).json({ status: 'success', message: 'comment updated', data: updatedComment });
    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Controller function to delete a comment from a blog
exports.deleteComment = async (req, res) => {
    try {
        // Extract the blog ID and comment ID from the request parameters
        const { id: blogId, comment_id: commentId } = req.params;

        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        // Find the comment by ID and delete it
        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return res.status(404).json({ status: 'error', message: 'Comment not found' });
        }

        const activity = new Activity({
            userid: user._id,
            username: user.username, // Assuming `user` is the logged-in user object
            blogid: blogId,
            commentid: commentId,
            action: 'blog_delete_comment'
        });
        await activity.save();


        res.status(200).json({ status: 'success', message: 'Comment deleted successfully' });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Function to get all comments for a particular blog
exports.getAllCommentsForBlog = async (req, res) => {
    try {
        // Perform user existence check
        const user = await User.findById(res.locals.userPayload.user.id);
        if (!user) return res.status(404).json({ status: 'error', message: 'User not found.' });

        const blogId = req.params.blogId; // Extract the blogId from the request parameters
        const comments = await Comment.find({ blogId: blogId }).populate('userId', 'username'); // Populate the userId field with the username

        if (comments.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No comments found for this blog.' });
        }

        res.status(200).json({ status: 'success', data: comments });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
