const express = require('express');
const crypto = require('crypto');
const Visitor = require('../models/Visitor');

const router = express.Router();
const COOKIE_NAME = 'visitorId';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60 * 1000; // 1 year

async function getCounts() {
  const [{ totalVisits } = { totalVisits: 0 }] = await Visitor.aggregate([
    { $group: { _id: null, totalVisits: { $sum: '$visits' } } },
  ]);
  const uniqueVisitors = await Visitor.countDocuments();
  return { totalVisits, uniqueVisitors };
}

router.post('/hit', async (req, res) => {
  try {
    let visitorId = req.cookies[COOKIE_NAME];
    let isNewVisitor = false;

    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
      res.cookie(COOKIE_NAME, visitorId, {
        maxAge: COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: 'lax',
      });
    }

    await Visitor.findOneAndUpdate(
      { visitorId },
      { $inc: { visits: 1 }, $set: { lastSeen: Date.now() } },
      { upsert: true, setDefaultsOnInsert: true },
    );

    const counts = await getCounts();
    res.json({ ...counts, isNewVisitor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const counts = await getCounts();
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
