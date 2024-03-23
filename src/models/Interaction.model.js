const mongoose = require('mongoose');

const interactionSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog', // Reference to the Blog model
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'share', 'bookmark'], // Example types, you can add more
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Interaction = mongoose.model('Interaction', interactionSchema);

module.exports = Interaction;
