const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
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

function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
    return [...new Set(tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 10);
}

function normalizeFeaturedImage(image) {
  if (!image || typeof image !== 'object' || !image.url) return undefined;
  try {
    const url = new URL(String(image.url).trim());
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    return { url: url.toString(), alt: String(image.alt || '').trim() };
  } catch {
    return undefined;
  }
}

function readingTimeMinutes(content) {
  const plainText = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[`*_>#\[\]()!~-]/g, ' ')
    .trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  return Math.max(1, Math.ceil(words / 200));
}

function serializePost(post, extra = {}) {
  const serialized = post.toObject ? post.toObject() : { ...post };
  delete serialized.previewTokenHash;
  return {
    ...serialized,
    readingTimeMinutes: readingTimeMinutes(serialized.content || ''),
    ...extra,
  };
}

function publicPostFilter() {
  return { $or: [{ status: 'published' }, { status: { $exists: false } }] };
}

function createPreviewToken() {
  return crypto.randomBytes(24).toString('hex');
}

function hashPreviewToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function postMatchesSearch(post, query) {
  if (!query) return true;
  const search = query.toLowerCase();
  return `${post.title} ${post.content}`.toLowerCase().includes(search);
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
    const filters = [publicPostFilter()];
    if (req.query.tag) filters.push({ tags: String(req.query.tag).trim().toLowerCase() });
    if (req.query.category) filters.push({ category: String(req.query.category).trim() });
    const posts = await BlogPost.find({ $and: filters }).sort({ publishedAt: -1, createdAt: -1 });
    res.json(posts.filter((post) => postMatchesSearch(post, req.query.q)).map((post) => serializePost(post)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: list all posts, including drafts
router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ updatedAt: -1, createdAt: -1 });
    res.json(posts.map((post) => serializePost(post)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: get a draft through an admin-generated preview token
router.get('/preview/:token', async (req, res) => {
  try {
    const post = await BlogPost.findOne({ previewTokenHash: hashPreviewToken(req.params.token) });
    if (!post) return res.status(404).json({ message: 'Preview not found' });
    res.json(serializePost(post, { isPreview: true }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Public: increment a published post's view count
router.post('/:id/view', async (req, res) => {
  try {
    const identifier = req.params.id;
    const lookup = [{ slug: identifier }];
    if (mongoose.Types.ObjectId.isValid(identifier)) lookup.push({ _id: identifier });
    const post = await BlogPost.findOneAndUpdate(
      { $and: [{ $or: lookup }, publicPostFilter()] },
      { $inc: { viewCount: 1 } },
      { new: true },
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json({ viewCount: post.viewCount });
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
        publicPostFilter(),
      ],
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const relatedCriteria = [];
    if (post.tags?.length) relatedCriteria.push({ tags: { $in: post.tags } });
    if (post.category) relatedCriteria.push({ category: post.category });
    const related = relatedCriteria.length
      ? await BlogPost.find({ $and: [publicPostFilter(), { _id: { $ne: post._id } }, { $or: relatedCriteria }] })
        .sort({ publishedAt: -1, createdAt: -1 }).limit(6)
      : [];
    const relatedPosts = related
      .map((relatedPost) => ({
        post: relatedPost,
        score: (relatedPost.tags || []).filter((tag) => (post.tags || []).includes(tag)).length
          + (post.category && relatedPost.category === post.category ? 1 : 0),
      }))
      .sort((left, right) => right.score - left.score)
      .map(({ post: relatedPost }) => serializePost(relatedPost));
    res.json(serializePost(post, { relatedPosts }));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create a post
router.post('/', requireAdmin, async (req, res) => {
  const title = (req.body.title || '').trim();
  const content = (req.body.content || '').trim();
  const status = req.body.status || 'draft';
  const featuredImage = normalizeFeaturedImage(req.body.featuredImage);
  const previewToken = createPreviewToken();

  if (!title || !content || !['draft', 'published'].includes(status)) {
    return res.status(400).json({ message: 'title, content, and a valid status are required' });
  }

  try {
    const post = await BlogPost.create({
      title,
      content,
      slug: await uniqueSlug(title),
      status,
      featuredImage,
      tags: normalizeTags(req.body.tags),
      category: typeof req.body.category === 'string' ? req.body.category.trim() : undefined,
      previewTokenHash: hashPreviewToken(previewToken),
      publishedAt: status === 'published' ? new Date() : undefined,
    });
    res.status(201).json(serializePost(post, { previewToken }));
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
    if (Object.prototype.hasOwnProperty.call(req.body, 'featuredImage')) {
      post.featuredImage = normalizeFeaturedImage(req.body.featuredImage);
    }
    if (Array.isArray(req.body.tags)) post.tags = normalizeTags(req.body.tags);
    if (typeof req.body.category === 'string') post.category = req.body.category.trim();
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
    const previewToken = createPreviewToken();
    post.previewTokenHash = hashPreviewToken(previewToken);

    const updatedPost = await post.save();
    res.json(serializePost(updatedPost, { previewToken }));
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
