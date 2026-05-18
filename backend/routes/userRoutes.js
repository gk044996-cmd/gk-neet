const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Result = require('../models/Result');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    const message = `Your email verification OTP for GK NEET MOCK is: ${otp}\n\nIt will expire in 5 minutes.\nPlease do not share this OTP with anyone.`;
    try {
      await sendEmail({
        email,
        subject: 'GK NEET MOCK - Email Verification OTP',
        message
      });
      console.log('\n=============================================');
      console.log('✅ EMAIL SENT SUCCESSFULLY');
      console.log(`Email dispatched to: ${email}`);
      console.log(`Generated OTP: [ ${otp} ]`);
      console.log('=============================================\n');
    } catch (emailErr) {
      console.log('\n=============================================');
      console.log('⚠️  EMAIL FAILED TO SEND ⚠️');
      console.log('Error:', emailErr.message);
      console.log('=============================================\n');
      return res.status(500).json({ error: 'Failed to send OTP email. Please check server configuration.' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp, type } = req.body;
  if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });
    
    // Delete OTP after successful verification, unless it is for password reset
    if (type !== 'reset') {
      await OTP.deleteMany({ email });
    }
    
    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No account found with this email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    const message = `Your password reset OTP for GK NEET MOCK is: ${otp}\n\nIt will expire in 5 minutes.\nPlease do not share this OTP with anyone.`;
    try {
      await sendEmail({
        email,
        subject: 'GK NEET MOCK - Password Reset OTP',
        message
      });
      console.log('\n=============================================');
      console.log('✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY');
      console.log(`Email dispatched to: ${email}`);
      console.log('=============================================\n');
    } catch (emailErr) {
      console.log('\n=============================================');
      console.log('⚠️  EMAIL FAILED TO SEND ⚠️');
      console.log('Error:', emailErr.message);
      console.log('=============================================\n');
      return res.status(500).json({ error: 'Failed to send OTP email. Please check server configuration.' });
    }

    res.json({ message: 'Password reset OTP sent successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Missing required fields' });
  
  if (newPassword.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

  try {
    const record = await OTP.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: 'Invalid or expired OTP' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    await OTP.deleteMany({ email });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { email, password, name, username } = req.body;
  
  if (!username) return res.status(400).json({ error: 'Username is required' });
  
  try {
    let existingEmail = await User.findOne({ email });
    if (existingEmail) return res.status(400).json({ error: 'User with this email already exists' });

    // Case-insensitive username check
    let existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken. Please choose another username.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userRole = 'student'; // Always student on register
    const user = new User({ email, password: hashedPassword, name, username, role: userRole, isVerified: true });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'mysecretkey123', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email, name: user.name, username: user.username, role: user.role } });
  } catch (err) {
    if (err.code === 11000) {
      if (err.keyPattern?.username) return res.status(400).json({ error: 'Username already taken. Please choose another username.' });
      if (err.keyPattern?.email) return res.status(400).json({ error: 'User with this email already exists' });
    }
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

// Update Profile
router.put('/profile', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token, authorization denied' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mysecretkey123');
    const { name, username } = req.body;
    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (username && username.toLowerCase() !== (user.username || '').toLowerCase()) {
      let existingUsername = await User.findOne({ username: { $regex: new RegExp(`^${username}$`, 'i') } });
      if (existingUsername) return res.status(400).json({ error: 'Username already taken. Please choose another username.' });
      user.username = username;
    }
    
    if (name) user.name = name;
    
    await user.save();
    res.json({ message: 'Profile updated successfully', user: { id: user._id, email: user.email, name: user.name, username: user.username, role: user.role } });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern?.username) {
      return res.status(400).json({ error: 'Username already taken. Please choose another username.' });
    }
    res.status(500).json({ error: err.message });
  }
});

// Get Leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const results = await Result.find({ completed: true });
    const userIdsWithResults = [...new Set(results.map(r => r.userId.toString()))];
    const users = await User.find({ _id: { $in: userIdsWithResults } }).select('name email');

    let leaderboard = users.map(user => {
      const userResults = results.filter(r => r.userId.toString() === user._id.toString());
      const totalTests = userResults.length;
      
      let highestScore = -Infinity;
      let timeTaken = 0;
      let earliestSubmission = new Date();
      let accuracy = 0;
      let totalCorrect = 0;
      let totalWrong = 0;
      let totalAttempted = 0;

      if (totalTests > 0) {
        highestScore = Math.max(...userResults.map(r => r.score != null ? r.score : -Infinity));
        const highestScoreResults = userResults.filter(r => r.score === highestScore);
        
        // Sort highest score results by highest accuracy, then lowest timeTaken
        highestScoreResults.sort((a, b) => {
           if (b.accuracy !== a.accuracy) return (b.accuracy || 0) - (a.accuracy || 0);
           return (a.timeTaken || 0) - (b.timeTaken || 0);
        });
        
        const bestResult = highestScoreResults[0];
        earliestSubmission = bestResult.submittedAt || bestResult.attemptedAt || new Date();
        timeTaken = bestResult.timeTaken || 0;
        
        totalCorrect = bestResult.correctCount || 0;
        totalWrong = bestResult.wrongCount || 0;
        totalAttempted = totalCorrect + totalWrong;
        accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
      }
      
      return {
        _id: user._id,
        name: user.name,
        totalTests,
        highestScore,
        accuracy,
        timeTaken,
        correctAnswers: totalCorrect,
        wrongAnswers: totalWrong,
        totalAttempted,
        earliestSubmission
      };
    });

    leaderboard = leaderboard.filter(l => l.totalTests > 0);

    // Rank primarily by highestScore, then accuracy, then lowest timeTaken, then earlier submission time
    leaderboard.sort((a, b) => {
      if (b.highestScore !== a.highestScore) return b.highestScore - a.highestScore;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return new Date(a.earliestSubmission) - new Date(b.earliestSubmission);
    });

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
