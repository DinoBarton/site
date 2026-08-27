const express = require('express');
const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

function createSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'post';
}

async function uniqueSlug(title, postId) {
  const baseSlug = createSlug(title);
  let slug = baseSlug;
  let suffix = 2;

  while (await BlogPost.exists({ slug, ...(postId ? { _id: { $ne: postId } } : {}) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

// Public: list posts, newest first
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({
      $or: [{ status: 'published' }, { status: { $exists: false } }],
    }).sort({ publishedAt: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list all posts, including drafts
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: get one post
router.get('/:id', async (req, res) => {
  try {
    const identifier = req.params.id;
    const lookup = [
      { slug: identifier },
    ];

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      lookup.push({ _id: identifier });
    }

    const post = await BlogPost.findOne({
      $and: [
        { $or: lookup },
        { $or: [{ status: 'published' }, { status: { $exists: false } }] },
      ],
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create a post
router.post('/', requireAdmin, async (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const status = req.body.status || 'draft';

  if (!title || !content || !['draft', 'published'].includes(status)) {
    return res.status(400).json({ message: 'title, content, and a valid status are required' });
  }

  try {
    const post = await BlogPost.create({
      title,
      content,
      slug: await uniqueSlug(title),
      status,
      publishedAt: status === 'published' ? new Date() : undefined,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: update a post
router.patch('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (typeof req.body.title === 'string') post.title = req.body.title.trim();
    if (typeof req.body.content === 'string') post.content = req.body.content.trim();
    if (!post.title || !post.content) {
      return res.status(400).json({ message: 'title and content are required' });
    }
    if (typeof req.body.status === 'string') {
      if (!['draft', 'published'].includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid post status' });
      }
      post.status = req.body.status;
      post.publishedAt = req.body.status === 'published'
        ? post.publishedAt || new Date()
        : undefined;
    }
    if (typeof req.body.title === 'string') {
      post.slug = await uniqueSlug(post.title, post._id);
    } else if (!post.slug) {
      post.slug = await uniqueSlug(post.title, post._id);
    }
    post.updatedAt = Date.now();

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Admin: delete a post
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
