const Blog = require('../models/Blogs.model');
const User = require('../models/User.model');
const Activity = require('../models/Activity.model');

// Function to get user profile
exports.getUserProfile = async (req, res) => {
    try {

        const user = await User.findById(res.locals.userPayload.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};


// Function to update user profile
exports.updateUserProfile = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(res.locals.userPayload.user.id, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', data: updatedUser });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Function to delete user profile
exports.deleteUserProfile = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(res.locals.userPayload.user.id);
        if (!deletedUser) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }
        res.status(200).json({ status: 'success', message: 'User profile deleted successfully' });
    } catch (error) {
        console.error('Error deleting user profile:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Function to get blogs created by the user
exports.getUserBlogs = async (req, res) => {
    try {
        const userBlogs = await Blog.find({ userid: res.locals.userPayload.user.id });
        res.status(200).json({ status: 'success', data: userBlogs });
    } catch (error) {
        console.error('Error fetching user blogs:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

// Function to get activity history of the user
exports.getUserActivity = async (req, res) => {
    try {
        const userActivity = await Activity.find({ userid: res.locals.userPayload.user.id});
        res.status(200).json({ status: 'success', data: userActivity });
    } catch (error) {
        console.error('Error fetching user activity:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
