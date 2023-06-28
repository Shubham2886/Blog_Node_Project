const mongoose = require('mongoose');

const userBlogSchema = new mongoose.Schema({
  blogTitle: {
    type: String,
    required: true,
    maxlength: 150,
  },
  blogImage: {
    type: String,
    required: true,
  },
  blogContent: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  blogCategory: {
    type: String,
    required: true,
  },
  blogStatus: {
    type: String,
    enum: ['active', 'draft', 'deleted'],
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  // userName: {
  //   type: String,
  //   required: true,
  // },
});

const UserBlog = mongoose.model('UserBlog', userBlogSchema);

module.exports = UserBlog;
