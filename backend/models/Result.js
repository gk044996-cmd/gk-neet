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
  attemptedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },
  completed: { type: Boolean, default: false },
  percentage: { type: Number, default: 0 },
  timeTaken: { type: Number, default: 0 },
  submissionType: { type: String, enum: ['manual', 'auto'], default: 'manual' }
}, { timestamps: true });

// Add Indexes for fast queries
resultSchema.index({ userId: 1 });
resultSchema.index({ testId: 1 });
resultSchema.index({ score: -1, accuracy: -1, timeTaken: 1 }); // Leaderboard index

module.exports = mongoose.model('Result', resultSchema);
