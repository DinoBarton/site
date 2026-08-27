const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  featuredImage: {
    url: { type: String, trim: true, maxlength: 1000 },
    alt: { type: String, trim: true, maxlength: 200 },
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 40,
  }],
  category: {
    type: String,
    trim: true,
    maxlength: 80,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
  publishedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  previewTokenHash: String,
});

module.exports = mongoose.model('BlogPost', blogPostSchema);
