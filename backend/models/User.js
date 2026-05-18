const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  password: { type: String },
  googleId: { type: String },
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  isVerified: { type: Boolean, default: false },
  hasBadge: { type: Boolean, default: false },
  badgeExpiry: { type: Date },
  history: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    score: Number,
    correct: Number,
    incorrect: Number,
    unattempted: Number,
    timeTaken: Number,
    subjectAccuracy: Object,
    date: { type: Date, default: Date.now }
  }],
  attemptedTests: [{
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' },
    score: Number,
    accuracy: Number,
    correctAnswers: Number,
    wrongAnswers: Number,
    unattempted: Number,
    submittedAt: { type: Date, default: Date.now },
    resultPdfUrl: String
  }],
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
