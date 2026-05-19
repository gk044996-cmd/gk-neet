const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Notification = require('../models/Notification');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, admin, checkPremiumAccess } = require('../middleware/auth');

const questionsData = [
  // Physics
  { subject: 'Physics', text: 'The unit of thermal conductivity is:', options: ['J m K^-1', 'J m^-1 K^-1', 'W m K^-1', 'W m^-1 K^-1'], correctAnswerIndex: 3 },
  { subject: 'Physics', text: 'If the kinetic energy of a free electron doubles, its de-Broglie wavelength changes by the factor:', options: ['1/sqrt(2)', 'sqrt(2)', '1/2', '2'], correctAnswerIndex: 0 },
  { subject: 'Physics', text: 'In a full wave rectifier circuit operating from 50 Hz mains frequency, the fundamental frequency in the ripple would be:', options: ['50 Hz', '100 Hz', '25 Hz', '70.7 Hz'], correctAnswerIndex: 1 },
  // Chemistry
  { subject: 'Chemistry', text: 'Which of the following is an amphoteric oxide?', options: ['V2O5', 'CrO', 'Cr2O3', 'MnO'], correctAnswerIndex: 0 },
  { subject: 'Chemistry', text: 'The number of d-electrons in Fe2+ (Z = 26) is not equal to the number of electrons in which one of the following?', options: ['d-electrons in Fe (Z = 26)', 'p-electrons in Ne (Z = 10)', 's-electrons in Mg (Z = 12)', 'p-electrons in Cl (Z = 17)'], correctAnswerIndex: 3 },
  { subject: 'Chemistry', text: 'Which of the following molecules has a zero dipole moment?', options: ['NH3', 'H2O', 'CO2', 'SO2'], correctAnswerIndex: 2 },
  // Botany
  { subject: 'Botany', text: 'Water soluble pigments found in plant cell vacuoles are:', options: ['Chlorophylls', 'Carotenoids', 'Anthocyanins', 'Xanthophylls'], correctAnswerIndex: 2 },
  { subject: 'Botany', text: 'In kranz anatomy, the bundle sheath cells have:', options: ['thin walls, many intercellular spaces and no chloroplasts', 'thick walls, no intercellular spaces and large number of chloroplasts', 'thin walls, no intercellular spaces and several chloroplasts', 'thick walls, many intercellular spaces and few chloroplasts'], correctAnswerIndex: 1 },
  { subject: 'Botany', text: 'Which one of the following is not a gaseous biogeochemical cycle in ecosystem?', options: ['Nitrogen cycle', 'Carbon cycle', 'Sulphur cycle', 'Phosphorus cycle'], correctAnswerIndex: 3 },
  // Zoology
  { subject: 'Zoology', text: 'Which of the following is an occupational respiratory disorder?', options: ['Anthracis', 'Silicosis', 'Botulism', 'Emphysema'], correctAnswerIndex: 1 },
  { subject: 'Zoology', text: 'Blood pressure in the mammalian aorta is maximum during:', options: ['Systole of the left ventricle', 'Diastole of the right atrium', 'Systole of the left atrium', 'Diastole of the right ventricle'], correctAnswerIndex: 0 },
  { subject: 'Zoology', text: 'Which of the following gastric cells indirectly help in erythropoiesis?', options: ['Chief cells', 'Mucous cells', 'Goblet cells', 'Parietal cells'], correctAnswerIndex: 3 }
];

router.post('/seed', async (req, res) => {
  try {
    await Question.deleteMany({});
    await Test.deleteMany({});

    const createdQuestions = await Question.insertMany(questionsData);
    const questionIds = createdQuestions.map(q => q._id);

    const test = new Test({
      title: 'NEET Full Mock Test 1 - PYQs',
      description: 'A realistic NEET mock test containing Previous Year Questions.',
      duration: 180,
      totalMarks: questionsData.length * 4,
      questions: questionIds
    });
    await test.save();

    res.json({ message: 'Seeded successfully', test });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Get all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find().select('-questions');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user's results
router.get('/my-results', protect, async (req, res) => {
  try {
    const results = await Result.find({ userId: req.user.id }).populate('testId').sort({ attemptedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single result by result ID
router.get('/result/:resultId', protect, async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate({
        path: 'testId',
        populate: { path: 'questions' }
      })
      .populate('selectedAnswers.questionId');
    if (!result) return res.status(404).json({ error: 'Result not found' });
    if (result.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get test by ID and Start Check
router.get('/:id', protect, checkPremiumAccess, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Check if test already attempted (unless admin)
    if (user.role !== 'admin') {
      const alreadyAttempted = user.attemptedTests.find(t => t.testId.toString() === req.params.id);
      // Fallback to check history as well for backward compatibility during migration
      const inHistory = user.history && user.history.find(t => t.testId.toString() === req.params.id);
      
      if (alreadyAttempted || inHistory) {
        return res.status(403).json({ error: 'You have already completed this test.' });
      }
    }

    const test = await Test.findById(req.params.id).populate('questions');
    if (!test) return res.status(404).json({ error: 'Test not found' });
    
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Create Test
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, duration, totalMarks, questions, published, type, accessType } = req.body;

    if (type === 'Full NEET Mock') {
      const qDocs = await Question.find({ _id: { $in: questions } });
      const physicsCount = qDocs.filter(q => q.subject === 'Physics').length;
      const chemistryCount = qDocs.filter(q => q.subject === 'Chemistry').length;
      const biologyCount = qDocs.filter(q => q.subject === 'Botany' || q.subject === 'Zoology').length;

      if (physicsCount !== 45 || chemistryCount !== 45 || biologyCount !== 90) {
        return res.status(400).json({ 
          error: `Full NEET mock must contain exactly 45 Physics, 45 Chemistry, and 90 Biology questions. Found: Physics(${physicsCount}), Chemistry(${chemistryCount}), Biology(${biologyCount}).` 
        });
      }
    }

    const test = new Test({ title, description, duration, totalMarks, questions, published, type, accessType: accessType || 'free', totalQuestions: questions.length });
    await test.save();

    // Update question usage tracking
    await Question.updateMany(
      { _id: { $in: questions } },
      { 
        $inc: { usageCount: 1 },
        $push: { usedInTests: { testId: test._id, testTitle: test.title, createdAt: new Date() } }
      }
    );

    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Update Test
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const test = await Test.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Delete Test
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluates and submits the test
router.post('/:id/submit', protect, checkPremiumAccess, async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { answers, timeTaken, submissionType = 'manual' } = req.body;
    const test = await Test.findById(req.params.id).populate('questions');
    
    // Prevent duplicate submissions
    const existingResult = await Result.findOne({ userId: user._id, testId: test._id });
    if (existingResult) {
      return res.status(400).json({ error: 'You have already submitted this test.', result: user.history.find(h => h.testId.toString() === test._id.toString()), detailedResult: existingResult });
    }
    
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let subjectWiseMarks = {};
    let answersArr = [];

    test.questions.forEach((q, i) => {
      const subject = q.subject;
      if (!subjectWiseMarks[subject]) subjectWiseMarks[subject] = 0;

      let isCorrect = false;

      if (answers[i] === undefined || answers[i] === null || answers[i] === '' || answers[i] === -1) {
        unattempted++;
      } else {
        // Evaluate
        const selectedOptionIndex = Number(answers[i]);
        const selectedText = q.options[selectedOptionIndex];
        
        if (q.correctAnswer !== undefined && q.correctAnswer !== null && q.correctAnswer !== '') {
          const correctAnswerStr = String(q.correctAnswer).trim().toLowerCase();
          
          let correctIndexFromLetter = -1;
          if (correctAnswerStr === 'a' || correctAnswerStr === '1') correctIndexFromLetter = 0;
          if (correctAnswerStr === 'b' || correctAnswerStr === '2') correctIndexFromLetter = 1;
          if (correctAnswerStr === 'c' || correctAnswerStr === '3') correctIndexFromLetter = 2;
          if (correctAnswerStr === 'd' || correctAnswerStr === '4') correctIndexFromLetter = 3;

          const selectedTextStr = selectedText ? String(selectedText).trim().toLowerCase() : '';
          const selectedIndexStr = String(selectedOptionIndex);
          
          if (
            selectedTextStr === correctAnswerStr || 
            selectedIndexStr === correctAnswerStr || 
            selectedOptionIndex === correctIndexFromLetter
          ) {
            isCorrect = true;
          }
        } 
        else if (q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) {
          if (selectedOptionIndex === Number(q.correctAnswerIndex)) {
            isCorrect = true;
          }
        }

        if (isCorrect) {
          correct++;
          subjectWiseMarks[subject] += 4;
        } else {
          incorrect++;
          subjectWiseMarks[subject] -= 1;
        }
      }

      answersArr.push({
        questionId: q._id,
        selectedOption: answers[i],
        isCorrect
      });
    });

    const score = (correct * 4) - (incorrect * 1);
    const accuracy = correct + incorrect > 0 ? (correct / (correct + incorrect)) * 100 : 0;
    
    const historyEntry = {
      testId: test._id,
      score,
      correct,
      incorrect,
      unattempted,
      timeTaken,
      subjectAccuracy: subjectWiseMarks,
      date: new Date()
    };
    
    const attemptedTestEntry = {
      testId: test._id,
      score,
      accuracy,
      correctAnswers: correct,
      wrongAnswers: incorrect,
      unattempted,
      submittedAt: new Date()
    };
    
    user.history.push(historyEntry);
    if (!user.attemptedTests) user.attemptedTests = [];
    user.attemptedTests.push(attemptedTestEntry);
    await user.save();
    
    // Create Result entry
    const result = new Result({
      userId: user._id,
      testId: test._id,
      score,
      correctCount: correct,
      wrongCount: incorrect,
      unattemptedCount: unattempted,
      accuracy,
      selectedAnswers: answersArr,
      subjectWiseMarks,
      completed: true,
      timeTaken,
      percentage: accuracy,
      submittedAt: new Date(),
      submissionType
    });
    await result.save();

    // Create Notification
    await Notification.create({
      userId: user._id,
      title: 'Test Completed',
      message: `You successfully completed ${test.title} with a score of ${score}/${test.totalMarks}.`,
      type: 'exam'
    });

    // Get the newly created history entry to send back
    const newEntry = user.history[user.history.length - 1];

    res.json({ message: 'Test submitted', result: newEntry, detailedResult: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
