const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String }, // questionText
  options: [{ type: String }],
  correctAnswerIndex: { type: Number },
  subject: { type: String, enum: ['Physics', 'Chemistry', 'Botany', 'Zoology'], required: true },
  chapter: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: String,
  
  // Universal fields
  questionType: { type: String, enum: ['MCQ', 'STATEMENT', 'ASSERTION_REASON', 'MATCH', 'IMAGE_BASED', 'SEQUENCE', 'TRUE_FALSE', 'MULTI_CORRECT'], default: 'MCQ' },
  statement1: String,
  statement2: String,
  statement3: String,
  statement4: String,
  assertion: String,
  reason: String,
  leftColumn: [String], // we can store arrays or raw strings
  rightColumn: [String],
  imageReference: String,
  correctAnswer: { type: String },

  usageCount: { type: Number, default: 0 },
  usedInTests: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    testTitle: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

// Add Indexes for fast querying
questionSchema.index({ subject: 1 });
questionSchema.index({ chapter: 1 });
questionSchema.index({ questionType: 1 });

module.exports = mongoose.model('Question', questionSchema);
