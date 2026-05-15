const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvtojson = require('csvtojson');
const xlsx = require('xlsx');
const Question = require('../models/Question');
const Test = require('../models/Test');
const User = require('../models/User');
const Result = require('../models/Result');
const { protect, admin } = require('../middleware/auth');


const upload = multer({ dest: 'uploads/' });

// Bulk upload questions via CSV or XLSX
router.post('/upload-questions', protect, admin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    let jsonArray = [];
    const filePath = req.file.path;
    const originalName = req.file.originalname.toLowerCase();

    if (originalName.endsWith('.csv')) {
      jsonArray = await csvtojson().fromFile(filePath);
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      jsonArray = xlsx.utils.sheet_to_json(sheet);
    } else {
      return res.status(400).json({ error: 'Unsupported file format. Please upload CSV or Excel files.' });
    }

    const requiredColumns = ['questionText', 'option1', 'option2', 'option3', 'option4', 'correctAnswer', 'subject'];
    const missingColumns = requiredColumns.filter(col => !Object.keys(jsonArray[0] || {}).includes(col));
    
    if (missingColumns.length > 0) {
      return res.status(400).json({ error: `Missing required columns: ${missingColumns.join(', ')}` });
    }

    const validQuestions = [];
    const errors = [];
    const previewData = [];
    
    const allowedSubjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];

    for (let i = 0; i < jsonArray.length; i++) {
      const item = jsonArray[i];
      const rowNum = i + 2; // Assuming row 1 is header
      
      let rowErrors = [];

      if (!item.questionText || !item.option1 || !item.option2 || !item.option3 || !item.option4 || item.correctAnswer === undefined || !item.subject) {
        rowErrors.push(`Missing required fields.`);
      }

      const correctAnsNum = parseInt(item.correctAnswer);
      if (isNaN(correctAnsNum) || correctAnsNum < 0 || correctAnsNum > 3) {
        rowErrors.push(`Invalid correctAnswer index. Must be 0, 1, 2, or 3.`);
      }

      // Auto subject mapping for Biology
      let mappedSubject = item.subject.trim();
      if (mappedSubject.toLowerCase() === 'biology') {
        const chapterLower = (item.chapter || '').toLowerCase();
        // Simple heuristic: if chapter has 'plant', 'botany', 'photosynthesis', etc.
        if (chapterLower.includes('plant') || chapterLower.includes('photosynthesis') || chapterLower.includes('morphology')) {
          mappedSubject = 'Botany';
        } else if (chapterLower.includes('animal') || chapterLower.includes('human') || chapterLower.includes('reproduction')) {
          mappedSubject = 'Zoology';
        } else {
          // Default split or ask user, let's default to Zoology if unknown
          mappedSubject = 'Zoology';
        }
      }
      
      // Capitalize first letter properly
      mappedSubject = mappedSubject.charAt(0).toUpperCase() + mappedSubject.slice(1).toLowerCase();

      if (!allowedSubjects.includes(mappedSubject) && rowErrors.length === 0) {
        rowErrors.push(`Invalid subject: ${mappedSubject}. Allowed: Physics, Chemistry, Botany, Zoology.`);
      }

      if (req.body.preview !== 'true') {
        const existingQuestion = await Question.findOne({ text: item.questionText });
        if (existingQuestion) {
          rowErrors.push(`Duplicate question found in database.`);
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: ${rowErrors.join(' ')}`);
        previewData.push({ rowNum, question: item.questionText, subject: mappedSubject, status: 'Error', reason: rowErrors.join(' ') });
      } else {
        const qObj = {
          text: item.questionText,
          options: [item.option1, item.option2, item.option3, item.option4],
          correctAnswerIndex: correctAnsNum,
          subject: mappedSubject,
          chapter: item.chapter || '',
          difficulty: item.difficulty || 'medium',
          explanation: item.explanation || ''
        };
        validQuestions.push(qObj);
        previewData.push({ rowNum, question: item.questionText, subject: mappedSubject, status: 'Valid', data: qObj });
      }
    }

    if (req.body.preview === 'true') {
      return res.json({ previewData, hasErrors: errors.length > 0, errors });
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    if (validQuestions.length > 0) {
      await Question.insertMany(validQuestions);
    }

    res.json({ message: `${validQuestions.length} questions imported successfully.` });
  } catch (err) {
    next(err);
  }
});

// Admin Dashboard stats
router.get('/stats', protect, admin, async (req, res, next) => {
  try {
    const totalQuestions = await Question.countDocuments();
    const totalTests = await Test.countDocuments();
    const publishedTests = await Test.countDocuments({ published: true });
    const totalUsers = await User.countDocuments();
    const totalAttempts = await Result.countDocuments();
    
    const results = await Result.find({}, 'score');
    const averageScore = results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0;

    res.json({ totalQuestions, totalTests, publishedTests, totalUsers, totalAttempts, averageScore });
  } catch (err) {
    next(err);
  }
});

// Get all users
router.get('/users', protect, admin, async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    const results = await Result.find();

    const usersWithStats = users.map(user => {
      const userResults = results.filter(r => r.userId.toString() === user._id.toString());
      const totalTests = userResults.length;
      const highestScore = totalTests > 0 ? Math.max(...userResults.map(r => r.score || 0)) : 0;
      const averageScore = totalTests > 0 ? Math.round(userResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests) : 0;
      const totalCorrect = userResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
      const totalQuestions = userResults.reduce((acc, r) => acc + ((r.correctCount || 0) + (r.wrongCount || 0) + (r.unattemptedCount || 0)), 0);
      const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      return {
        ...user.toObject(),
        totalTests,
        highestScore,
        averageScore,
        accuracy
      };
    });

    res.json(usersWithStats);
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    if (user.email === 'gk044996@gmail.com') {
      return res.status(403).json({ error: 'Cannot delete the main administrator.' });
    }
    
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({ error: 'You cannot delete yourself.' });
    }

    await User.findByIdAndDelete(req.params.id);
    await Result.deleteMany({ userId: req.params.id });
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get user history
router.get('/users/:id/history', protect, admin, async (req, res, next) => {
  try {
    const results = await Result.find({ userId: req.params.id }).populate('testId').sort({ attemptedAt: -1 });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// Get all test results across all users
router.get('/results', protect, admin, async (req, res, next) => {
  try {
    const results = await Result.find().populate('userId', 'name email').populate('testId', 'title').sort({ attemptedAt: -1 });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
