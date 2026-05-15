const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'backend');

const files = {
  'server.js': `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Routes
const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gk-neet';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  })
  .catch(err => console.error(err));
`,
  'models/User.js': `const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
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
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  streak: { type: Number, default: 0 },
  lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
`,
  'models/Notification.js': `const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['exam', 'reminder', 'alert'], default: 'alert' },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
`,
  'routes/analyticsRoutes.js': `const express = require('express');
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
          recommendations.push(\`Your \${sub} accuracy is \${avgSub.toFixed(1)}%. Focus on \${sub} chapter tests.\`);
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
`,
  'routes/adminRoutes.js': `const express = require('express');
const router = express.Router();
const multer = require('multer');
const csvtojson = require('csvtojson');
const Question = require('../models/Question');

const upload = multer({ dest: 'uploads/' });

// Bulk upload questions via CSV
router.post('/upload-questions', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    
    const jsonArray = await csvtojson().fromFile(req.file.path);
    
    const formattedQuestions = jsonArray.map(item => ({
      text: item.text,
      options: [item.option1, item.option2, item.option3, item.option4],
      correctAnswerIndex: parseInt(item.correctAnswerIndex),
      subject: item.subject,
      chapter: item.chapter,
      difficulty: item.difficulty || 'medium',
      explanation: item.explanation
    }));

    await Question.insertMany(formattedQuestions);
    res.json({ message: \`\${formattedQuestions.length} questions added successfully\` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(projectDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log('Backend upgrade files generated successfully.');
