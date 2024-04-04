const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    action: {
        type: String,
        enum: ['login', 'register', 'blog_create', 'blog_update', 'blog_delete','blog_comment','blog_update_comment','blog_delete_comment'], // Example actions, you can add more
        required: true
    },
    username:{
        type: String
    },
    blogid:{
        type: String
    },
    commentid:{
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
