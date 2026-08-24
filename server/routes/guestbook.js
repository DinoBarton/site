const express = require('express');
const GuestbookEntry = require('../models/GuestbookEntry');

const router = express.Router();

// Get all guestbook entries, newest first
router.get('/', async (req, res) => {
  try {
    const entries = await GuestbookEntry.find().sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Sign the guestbook
router.post('/', async (req, res) => {
  const name = (req.body.name || '').trim();
  const message = (req.body.message || '').trim();

  if (!name || !message) {
    return res.status(400).json({ message: 'name and message are required' });
  }

  try {
    const entry = await GuestbookEntry.create({ name, message });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
