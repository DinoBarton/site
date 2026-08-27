const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();

// Import routes
const examplesRouter = require('./routes/examples');
const visitsRouter = require('./routes/visits');
const guestbookRouter = require('./routes/guestbook');
const adminRouter = require('./routes/admin');
const blogRouter = require('./routes/blog');
const errorHandler = require('./middleware/errorHandler');
const ticker = require('./routes/ticker');
const systemStats = require('./routes/systemStats');
const uploadsRouter = require('./routes/uploads');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  index: false,
  dotfiles: 'deny',
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dinolibre', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Dinolibre API' });
});

// API Routes
app.use('/api/examples', examplesRouter);
app.use('/api/visits', visitsRouter);
app.use('/api/guestbook', guestbookRouter);
app.use('/api/admin', adminRouter);
app.use('/api/blog', blogRouter);
app.use('/api/ticker', ticker);
app.use('/api/system-stats', systemStats);
app.use('/api/uploads', uploadsRouter);

// Error handling middleware
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
