const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  type: { type: String, enum: ['Full NEET Mock', 'Physics Test', 'Chemistry Test', 'Biology Test', 'Chapter Test', 'Custom Test'], default: 'Custom Test' },
  totalQuestions: { type: Number },
  accessType: { type: String, enum: ['free', 'premium'], default: 'free' },
  published: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
