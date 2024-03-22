const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    blogtitle: {
        type: String,
        required: true,
        maxlength: 150
    },
    blogimage: {
        type: String,
        required: true
    },
    blogcontent: {
        type: String,
        required: true,
        maxlength: 5000
    },
    blogcategory: {
        type: String,
        required: true
    },
    blogstatus: {
        type: String,
        enum: ['active', 'draft', 'deleted'], // Ensure no leading or trailing spaces
        default: 'active'
    },
    userid: {
        type: String,
         required: true
    },
    lastupdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', blogSchema);
