const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'backend');

const files = {
  'server.js': `require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const testRoutes = require('./routes/testRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/tests', testRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gk-neet';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
  })
  .catch(err => console.error(err));
`,
  '.env': `PORT=5000
MONGO_URI=mongodb://localhost:27017/gk-neet
JWT_SECRET=your_jwt_secret_key_here
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
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
`,
  'models/Test.js': `const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  duration: { type: Number, required: true }, // in minutes
  totalMarks: { type: Number, required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

module.exports = mongoose.model('Test', testSchema);
`,
  'models/Question.js': `const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswerIndex: { type: Number, required: true },
  subject: { type: String, enum: ['Physics', 'Chemistry', 'Botany', 'Zoology'], required: true },
  chapter: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  explanation: String,
  imageUrl: String,
  type: { type: String, default: 'mcq' }
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
`,
  'routes/testRoutes.js': `const express = require('express');
const router = express.Router();
const Test = require('../models/Test');

// Get all tests
router.get('/', async (req, res) => {
  try {
    const tests = await Test.find().select('-questions');
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get test by ID
router.get('/:id', async (req, res) => {
  try {
    const test = await Test.findById(req.params.id).populate('questions');
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`,
  'routes/questionRoutes.js': `const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// Get questions (can filter by subject, chapter)
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find(req.query);
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
`,
  'routes/userRoutes.js': `const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create or get user
router.post('/sync', async (req, res) => {
  const { firebaseUid, email, name } = req.body;
  try {
    let user = await User.findOne({ firebaseUid });
    if (!user) {
      user = new User({ firebaseUid, email, name });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

console.log('Backend files generated successfully.');
