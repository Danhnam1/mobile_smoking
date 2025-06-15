const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  author_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  published_at: Date
});

const Blog = mongoose.model('Blog', blogSchema);
module.exports = Blog;