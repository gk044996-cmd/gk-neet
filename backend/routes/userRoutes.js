const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = 'student'; // Always student on register
    user = new User({ email, password: hashedPassword, name, role: userRole });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name: user.name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const ADMIN_EMAIL = 'gk044996@gmail.com';
    const ADMIN_PASS = 'RDganesh@789*$';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });
      if (!adminUser) {
        const salt = await bcrypt.genSalt(10);
        const hashedAdminPass = await bcrypt.hash(ADMIN_PASS, salt);
        adminUser = new User({ email: ADMIN_EMAIL, password: hashedAdminPass, name: 'Admin', role: 'admin' });
        await adminUser.save();
      } else if (adminUser.role !== 'admin') {
        adminUser.role = 'admin';
        await adminUser.save();
      }
      
      const token = jwt.sign({ id: adminUser._id, role: 'admin' }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' });
      return res.json({ token, user: { id: adminUser._id, email: adminUser.email, name: adminUser.name, role: 'admin' }, redirectTo: '/admin' });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    } else {
       return res.status(400).json({ error: 'Please login using Google' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name: user.name, role: user.role }, redirectTo: '/dashboard' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Current User
router.get('/me', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    const user = await User.findById(decoded.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('name email');
    const results = await Result.find({ completed: true });

    let leaderboard = users.map(user => {
      const userResults = results.filter(r => r.userId.toString() === user._id.toString());
      const totalTests = userResults.length;
      const highestScore = totalTests > 0 ? Math.max(...userResults.map(r => r.score || 0)) : 0;
      
      const totalCorrect = userResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
      const totalAttempted = userResults.reduce((acc, r) => acc + ((r.correctCount || 0) + (r.wrongCount || 0)), 0);
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      const timeTaken = userResults.reduce((acc, r) => acc + (r.timeTaken || 0), 0);
      const correctAnswers = totalCorrect;
      const wrongAnswers = userResults.reduce((acc, r) => acc + (r.wrongCount || 0), 0);

      return {
        _id: user._id,
        name: user.name,
        totalTests,
        highestScore,
        accuracy,
        timeTaken,
        correctAnswers,
        wrongAnswers
      };
    });

    // Exclude users who haven't completed any tests
    leaderboard = leaderboard.filter(l => l.totalTests > 0);

    // Rank primarily by highestScore, then accuracy, then lowest timeTaken
    leaderboard.sort((a, b) => {
      if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return b.totalTests - a.totalTests;
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
