const express = require('express');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();
const uploadDirectory = path.join(__dirname, '..', 'uploads');
const acceptedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!acceptedMimeTypes.has(file.mimetype)) {
      return callback(new Error('Only JPEG, PNG, GIF, and WebP images are supported'));
    }
    callback(null, true);
  },
});

function publicOrigin(req) {
  return (process.env.PUBLIC_ORIGIN || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
}

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'An image file is required' });

  try {
    const filename = `${crypto.randomBytes(24).toString('hex')}.webp`;
    await fs.mkdir(uploadDirectory, { recursive: true });
    await sharp(req.file.buffer, { limitInputPixels: 40e6 })
      .rotate()
      .webp({ quality: 82 })
      .toFile(path.join(uploadDirectory, filename));

    res.status(201).json({ url: `${publicOrigin(req)}/uploads/${filename}` });
  } catch (error) {
    res.status(400).json({ message: 'The uploaded file is not a valid image' });
  }
});

module.exports = router;
