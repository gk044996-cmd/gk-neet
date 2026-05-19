const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    req.user = await User.findById(decoded.id).select('-password');
    
    if (req.user) {
      if (req.user.isPremium && req.user.premiumExpiresAt && req.user.premiumExpiresAt < new Date()) {
        req.user.isPremium = false;
        req.user.premiumPlan = 'free';
        await req.user.save();
      }
    }
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Not authorized, token failed' });
  }
};

const checkPremiumAccess = async (req, res, next) => {
  try {
    const testId = req.params.id;
    if (!testId) return next();
    
    const mongoose = require('mongoose');
    const Test = mongoose.model('Test');
    const test = await Test.findById(testId);
    
    if (test && test.accessType === 'premium' && req.user && !req.user.isPremium && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Premium subscription required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin, checkPremiumAccess };
