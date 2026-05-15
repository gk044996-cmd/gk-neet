const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, admin } = require('../middleware/auth');


// Get questions (can filter by subject, chapter, search, pagination)
router.get('/', async (req, res) => {
  try {
    const { search, subject, difficulty, chapter, type, usageStatus, page = 1, limit = 50, fetchAll } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: 'i' } },
        { chapter: { $regex: search, $options: 'i' } }
      ];
    }
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (chapter) query.chapter = { $regex: chapter, $options: 'i' };
    if (type) query.type = type;
    
    if (usageStatus === 'fresh') query.usageCount = 0;
    else if (usageStatus === 'used') query.usageCount = { $gt: 0 };
    else if (usageStatus === 'frequent') query.usageCount = { $gt: 2 };

    if (fetchAll === 'true') {
      const questions = await Question.find(query).sort({ createdAt: -1 });
      return res.json({ questions, total: questions.length, page: 1, totalPages: 1 });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const questions = await Question.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    const total = await Question.countDocuments(query);

    res.json({
      questions,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create question
router.post('/', protect, admin, async (req, res) => {
  try {
    const question = new Question(req.body);
    await question.save();
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update question
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete question
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id);
    res.json({ message: 'Question deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
