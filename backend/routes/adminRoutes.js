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

    const validQuestions = [];
    const errors = [];
    const previewData = [];
    
    const allowedSubjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
    const allowedTypes = ['MCQ', 'STATEMENT', 'ASSERTION_REASON', 'MATCH', 'IMAGE_BASED', 'SEQUENCE', 'TRUE_FALSE', 'MULTI_CORRECT'];

    for (let i = 0; i < jsonArray.length; i++) {
      const item = jsonArray[i];
      const rowNum = i + 2; // Assuming row 1 is header
      
      let rowErrors = [];

      // Capitalize mappedSubject safely
      let rawSubject = item.subject ? String(item.subject).trim() : '';
      if (!rawSubject) {
        rowErrors.push('Missing required field: subject.');
      }

      let mappedSubject = rawSubject;
      if (mappedSubject.toLowerCase() === 'biology') {
        const chapterLower = (item.chapter || '').toLowerCase();
        if (chapterLower.includes('plant') || chapterLower.includes('photosynthesis') || chapterLower.includes('morphology')) {
          mappedSubject = 'Botany';
        } else if (chapterLower.includes('animal') || chapterLower.includes('human') || chapterLower.includes('reproduction')) {
          mappedSubject = 'Zoology';
        } else {
          mappedSubject = 'Zoology';
        }
      }
      
      if (mappedSubject) {
        mappedSubject = mappedSubject.charAt(0).toUpperCase() + mappedSubject.slice(1).toLowerCase();
        if (!allowedSubjects.includes(mappedSubject)) {
          rowErrors.push(`Invalid subject: ${mappedSubject}.`);
        }
      }

      let qType = item.questionType ? String(item.questionType).trim().toUpperCase() : 'MCQ';
      if (!allowedTypes.includes(qType)) {
        rowErrors.push(`Invalid questionType: ${qType}.`);
      }

      // Validation logic per question type
      if (qType === 'MCQ' || qType === 'SEQUENCE' || qType === 'MULTI_CORRECT') {
        if (!item.questionText) rowErrors.push('Missing questionText.');
        if (!item.option1 || !item.option2 || !item.option3 || !item.option4) rowErrors.push('Missing options (1-4).');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      } else if (qType === 'STATEMENT') {
        if (!item.questionText) rowErrors.push('Missing questionText.');
        if (!item.statement1 || !item.statement2) rowErrors.push('Missing statement1 and statement2.');
        if (!item.option1 || !item.option2 || !item.option3 || !item.option4) rowErrors.push('Missing options (1-4).');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      } else if (qType === 'ASSERTION_REASON') {
        if (!item.assertion || !item.reason) rowErrors.push('Missing assertion or reason.');
        if (!item.option1 || !item.option2 || !item.option3 || !item.option4) rowErrors.push('Missing options (1-4).');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      } else if (qType === 'MATCH') {
        if (!item.leftColumn || !item.rightColumn) rowErrors.push('Missing leftColumn or rightColumn (comma separated).');
        if (!item.option1 || !item.option2 || !item.option3 || !item.option4) rowErrors.push('Missing options (1-4).');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      } else if (qType === 'IMAGE_BASED') {
        if (!item.imageReference) rowErrors.push('Missing imageReference.');
        if (!item.questionText) rowErrors.push('Missing questionText.');
        if (!item.option1 || !item.option2 || !item.option3 || !item.option4) rowErrors.push('Missing options (1-4).');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      } else if (qType === 'TRUE_FALSE') {
        if (!item.questionText) rowErrors.push('Missing questionText.');
        if (!item.correctAnswer) rowErrors.push('Missing correctAnswer.');
      }

      if (req.body.preview !== 'true') {
        if (item.questionText && qType !== 'ASSERTION_REASON') {
          const existingQuestion = await Question.findOne({ text: item.questionText });
          if (existingQuestion) {
            rowErrors.push(`Duplicate question found in database.`);
          }
        }
      }

      if (rowErrors.length > 0) {
        errors.push(`Row ${rowNum}: ${rowErrors.join(' ')}`);
        previewData.push({ rowNum, question: item.questionText || item.assertion || 'N/A', subject: mappedSubject, status: 'Error', reason: rowErrors.join(' ') });
      } else {
        const qObj = {
          questionType: qType,
          text: item.questionText || '',
          options: [item.option1, item.option2, item.option3, item.option4].filter(Boolean),
          correctAnswer: item.correctAnswer ? String(item.correctAnswer).trim() : undefined,
          subject: mappedSubject,
          chapter: item.chapter || '',
          difficulty: item.difficulty || 'medium',
          explanation: item.explanation || '',
          statement1: item.statement1 || '',
          statement2: item.statement2 || '',
          statement3: item.statement3 || '',
          statement4: item.statement4 || '',
          assertion: item.assertion || '',
          reason: item.reason || '',
          leftColumn: item.leftColumn ? item.leftColumn.split('|').map(s=>s.trim()) : [],
          rightColumn: item.rightColumn ? item.rightColumn.split('|').map(s=>s.trim()) : [],
          imageReference: item.imageReference || ''
        };
        // For backwards compatibility
        const correctAnsNum = parseInt(item.correctAnswer);
        if (!isNaN(correctAnsNum) && correctAnsNum >= 0 && correctAnsNum <= 3) {
          qObj.correctAnswerIndex = correctAnsNum;
        }

        validQuestions.push(qObj);
        previewData.push({ rowNum, question: item.questionText || item.assertion, subject: mappedSubject, status: 'Valid', data: qObj });
      }
    }

    if (req.body.preview === 'true') {
      return res.json({ previewData, hasErrors: errors.length > 0, errors });
    }

    if (validQuestions.length > 0) {
      await Question.insertMany(validQuestions);
    }

    res.json({ message: `${validQuestions.length} questions imported successfully.`, failedCount: errors.length, errors });
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
    
    const results = await Result.find({ completed: true }, 'score');
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
    const results = await Result.find({ completed: true });

    const usersWithStats = users.map(user => {
      const userResults = results.filter(r => r.userId.toString() === user._id.toString());
      const totalTests = userResults.length;
      const highestScore = totalTests > 0 ? Math.max(...userResults.map(r => r.score || 0)) : 0;
      const averageScore = totalTests > 0 ? Math.round(userResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests) : 0;
      const totalCorrect = userResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
      const totalAttempted = userResults.reduce((acc, r) => acc + ((r.correctCount || 0) + (r.wrongCount || 0)), 0);
      const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

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
    const results = await Result.find({ completed: true }).populate('userId', 'name email').populate('testId', 'title').sort({ attemptedAt: -1 });
    res.json(results);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
