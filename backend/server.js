require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const path = require('path');
const connectDB = require('./config/db');
const app = express();

// Security Middlewares

// Security Middlewares
// Security & Optimization Middlewares
app.use(helmet({
  contentSecurityPolicy: false // Allows loading external resources like google fonts, images, etc.
}));
app.use(cors());
app.use(compression()); // Compress all responses for speed
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
// Trust the reverse proxy (Render load balancer) to fix rate limiter IP tracking
app.set('trust proxy', 1);

const limiter = rateLimit({
  max: 5000, // Increased for development/testing
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Connect Database before routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed in middleware:", err);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: err.message
    });
  }
});

// Routes
const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment', paymentRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

// Base Route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'GK NEET MOCK API Server is running successfully.' });
});

const PORT = process.env.PORT || 5000;

// Only listen if not running in Vercel
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, async () => {
    try {
      await connectDB();
      console.log(`Server running on port ${PORT}`);
    } catch (err) {
      console.error("Failed to connect to database on startup:", err);
    }
  });
}

// Export app for Vercel Serverless Functions
module.exports = app;

