const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  subject: { type: String, enum: ['Physics', 'Chemistry', 'Botany', 'Zoology'], required: true },
  chapter: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: String,
  imageUrl: String,
  type: { type: String, default: 'mcq' },
  usageCount: { type: Number, default: 0 },
  usedInTests: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    testTitle: String,
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
