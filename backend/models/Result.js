const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  score: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  unattemptedCount: { type: Number, default: 0 },
  accuracy: { type: Number, required: true },
  selectedAnswers: [{
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: Number,
    isCorrect: Boolean
  }],
  subjectWiseMarks: { type: Object, default: {} },
  attemptedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
