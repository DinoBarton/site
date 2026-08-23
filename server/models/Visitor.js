const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  visitorId: {
    type: String,
    required: true,
    unique: true,
  },
  visits: {
    type: Number,
    default: 1,
  },
  firstSeen: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Visitor', visitorSchema);
