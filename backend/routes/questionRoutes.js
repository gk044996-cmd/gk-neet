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

// Admin: Bulk Delete Questions
router.post('/bulk-delete', protect, admin, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No question IDs provided.' });
    }
    await Question.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} questions deleted successfully.` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Random Questions for Full NEET Mock
router.get('/random-neet-mock', protect, admin, async (req, res) => {
  try {
    const physics = await Question.aggregate([{ $match: { subject: 'Physics' } }, { $sample: { size: 45 } }]);
    const chemistry = await Question.aggregate([{ $match: { subject: 'Chemistry' } }, { $sample: { size: 45 } }]);
    const botany = await Question.aggregate([{ $match: { subject: 'Botany' } }, { $sample: { size: 45 } }]);
    const zoology = await Question.aggregate([{ $match: { subject: 'Zoology' } }, { $sample: { size: 45 } }]);
    
    // If Botany/Zoology not enough, try using any remaining biology questions
    // But for a perfect NEET mock, 45 Botany, 45 Zoology is best. 
    // If they just have "Biology", we just pull 90 from Biology subjects.
    
    // Since we store Botany and Zoology separately:
    const biologyTotal = botany.length + zoology.length;
    let questions = [...physics, ...chemistry, ...botany, ...zoology];
    
    // If exactly 45 Botany / 45 Zoology aren't available, we fallback to just grabbing 90 combined.
    if (biologyTotal < 90) {
      const bioCombined = await Question.aggregate([
        { $match: { subject: { $in: ['Botany', 'Zoology'] } } }, 
        { $sample: { size: 90 } }
      ]);
      questions = [...physics, ...chemistry, ...bioCombined];
    }

    if (physics.length < 45 || chemistry.length < 45 || questions.length < 180) {
      return res.status(400).json({ error: `Not enough questions in database. Required: 45 Physics, 45 Chemistry, 90 Biology. Found: ${physics.length} Physics, ${chemistry.length} Chemistry, ${questions.length - physics.length - chemistry.length} Biology.` });
    }

    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
