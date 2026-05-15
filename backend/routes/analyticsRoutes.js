const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get advanced analytics and recommendations
router.get('/:firebaseUid', async (req, res, next) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid }).populate('history.testId');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const history = user.history;
    if (history.length === 0) {
      return res.json({ analytics: {}, recommendations: ['Attempt your first mock test!'] });
    }

    // Analytics Calculation (Internal Logic)
    let totalScore = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let subjectAccuracies = { Physics: [], Chemistry: [], Botany: [], Zoology: [] };

    history.forEach(attempt => {
      totalScore += attempt.score;
      totalCorrect += attempt.correct;
      totalIncorrect += attempt.incorrect;
      if (attempt.subjectAccuracy) {
        Object.keys(attempt.subjectAccuracy).forEach(sub => {
          if(subjectAccuracies[sub]) subjectAccuracies[sub].push(attempt.subjectAccuracy[sub]);
        });
      }
    });

    const avgScore = totalScore / history.length;
    
    // Recommendations Engine based on internal data
    let recommendations = [];
    Object.keys(subjectAccuracies).forEach(sub => {
      if (subjectAccuracies[sub].length > 0) {
        const avgSub = subjectAccuracies[sub].reduce((a, b) => a + b, 0) / subjectAccuracies[sub].length;
        if (avgSub < 60) {
          recommendations.push(`Your ${sub} accuracy is ${avgSub.toFixed(1)}%. Focus on ${sub} chapter tests.`);
        }
      }
    });

    if (totalIncorrect > totalCorrect * 0.3) {
      recommendations.push('High negative marking detected! Avoid guessing unattempted questions.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep practicing full mock tests to maintain speed.');
    }

    res.json({
      analytics: {
        avgScore,
        totalTests: history.length,
        totalCorrect,
        totalIncorrect,
        streak: user.streak
      },
      recommendations
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
