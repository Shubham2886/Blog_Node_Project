const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    action: {
        type: String,
        enum: ['login', 'register', 'logout', 'blog_create', 'blog_update', 'blog_delete'], // Example actions, you can add more
        required: true
    },
    username:{
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
