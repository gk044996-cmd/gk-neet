const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'frontend', 'src');

const files = {
  'components/Navbar.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  return (
    <nav className="fixed w-full z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GK NEET MOCK</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <button onClick={logout} className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}`,
  'components/Footer.jsx': `import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-4">GK NEET MOCK</h3>
          <p className="mb-4">Prepare for your NEET exam with real simulation, detailed analytics, and professional feedback.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary">Home</a></li>
            <li><a href="#" className="hover:text-primary">Mock Tests</a></li>
            <li><a href="#" className="hover:text-primary">Leaderboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary">FAQ</a></li>
            <li><a href="#" className="hover:text-primary">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center">
        <p>&copy; {new Date().getFullYear()} GK NEET MOCK. All rights reserved.</p>
      </div>
    </footer>
  );
}`,
  'pages/Home.jsx': `import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/5 dark:to-accent/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Prepare Like <br/>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Real NEET</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto"
          >
            Experience the exact NTA exam pattern, get detailed analytics, and improve your score with our premium mock test platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link to="/register" className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 w-full sm:w-auto">
              Start Mock Test
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all w-full sm:w-auto">
              View Analytics
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to crack NEET with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'NTA Pattern', desc: 'Exact exam interface with 180 questions, negative marking, and timer.' },
              { title: 'In-Depth Analytics', desc: 'Subject-wise performance, time tracking, and accuracy graphs.' },
              { title: 'Detailed Solutions', desc: 'Comprehensive explanations for every question after submission.' }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-bold">{i+1}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`,
  'pages/Dashboard.jsx': `import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState([]);

  useEffect(() => {
    // Fetch user's tests and recommended tests
    setTests([
      { id: 1, title: 'NEET Full Mock Test 1', duration: 180, questions: 200 },
      { id: 2, title: 'Biology Unit Test', duration: 45, questions: 50 },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.email}</h1>
        <p className="text-slate-500">Track your progress and attempt new mock tests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Total Tests</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-primary">580<span className="text-sm text-slate-400">/720</span></p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Accuracy</h3>
          <p className="text-3xl font-bold text-green-500">85%</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Available Mock Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => (
          <div key={test.id} className="glass-panel p-6 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold mb-2">{test.title}</h3>
            <div className="flex justify-between text-sm text-slate-500 mb-6">
              <span>{test.questions} Questions</span>
              <span>{test.duration} Mins</span>
            </div>
            <Link to={\`/test/\${test.id}\`} className="mt-auto block w-full text-center py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
              Start Test
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'pages/MockTest.jsx': `import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const MOCK_QUESTIONS = [
  { id: 1, subject: 'Physics', text: 'A particle moves in a straight line with a constant acceleration.', options: ['Option A', 'Option B', 'Option C', 'Option D'] },
  { id: 2, subject: 'Chemistry', text: 'What is the hybridization of carbon in methane?', options: ['sp', 'sp2', 'sp3', 'sp3d'] },
  { id: 3, subject: 'Botany', text: 'Photosynthesis occurs in which organelle?', options: ['Mitochondria', 'Chloroplast', 'Nucleus', 'Ribosome'] },
  { id: 4, subject: 'Zoology', text: 'Which is the largest organ in the human body?', options: ['Liver', 'Heart', 'Skin', 'Brain'] }
];

export default function MockTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(180 * 60); // 3 hours

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  const handleOptionSelect = (optionIndex) => {
    setAnswers({ ...answers, [currentQIndex]: optionIndex });
  };

  const handleSaveNext = () => {
    if (currentQIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    }
  };

  const handleMarkReview = () => {
    setMarkedForReview({ ...markedForReview, [currentQIndex]: true });
    handleSaveNext();
  };

  const handleSubmit = () => {
    if(window.confirm('Are you sure you want to submit the test?')) {
      navigate(\`/result/\${id}\`);
    }
  };

  const currentQ = MOCK_QUESTIONS[currentQIndex];

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm px-6 py-4 flex justify-between items-center z-10">
        <div>
          <h1 className="text-xl font-bold">NEET Full Mock Test</h1>
          <p className="text-sm text-slate-500">{currentQ.subject}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className={\`text-2xl font-mono font-bold \${timeLeft < 600 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-300'}\`}>
            {formatTime(timeLeft)}
          </div>
          <button onClick={handleSubmit} className="px-6 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors">
            Submit Test
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Question {currentQIndex + 1}</h2>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm font-medium">+4 / -1</span>
            </div>
            <p className="text-lg mb-8">{currentQ.text}</p>
            <div className="space-y-4">
              {currentQ.options.map((opt, i) => (
                <label 
                  key={i} 
                  className={\`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all \${answers[currentQIndex] === i ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'}\`}
                >
                  <input 
                    type="radio" 
                    name={\`question-\${currentQIndex}\`} 
                    className="w-5 h-5 text-primary"
                    checked={answers[currentQIndex] === i}
                    onChange={() => handleOptionSelect(i)}
                  />
                  <span className="ml-4 text-lg">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Palette */}
        <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold mb-4">Question Palette</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500"></div> Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-slate-300"></div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500"></div> Marked</div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto grid grid-cols-5 gap-2 content-start">
            {MOCK_QUESTIONS.map((_, i) => {
              let statusClass = "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300";
              if (answers[i] !== undefined) statusClass = "bg-green-500 text-white";
              else if (markedForReview[i]) statusClass = "bg-purple-500 text-white";
              else if (i === currentQIndex) statusClass = "bg-red-500 text-white"; // currently visiting but not answered

              return (
                <button 
                  key={i} 
                  onClick={() => setCurrentQIndex(i)}
                  className={\`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm \${statusClass} \${currentQIndex === i ? 'ring-2 ring-offset-2 ring-primary' : ''}\`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <footer className="bg-white dark:bg-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] px-6 py-4 flex justify-between z-10">
        <button 
          onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
          disabled={currentQIndex === 0}
          className="px-6 py-3 rounded-xl border border-slate-300 font-semibold disabled:opacity-50"
        >
          Previous
        </button>
        <div className="flex gap-4">
          <button onClick={handleMarkReview} className="px-6 py-3 rounded-xl bg-purple-100 text-purple-700 font-semibold hover:bg-purple-200">
            Mark for Review
          </button>
          <button onClick={handleSaveNext} className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90">
            Save & Next
          </button>
        </div>
      </footer>
    </div>
  );
}`,
  'pages/Result.jsx': `import React from 'react';
import { useParams, Link } from 'react-router-dom';

export default function Result() {
  const { id } = useParams();

  // Mock Result Data
  const data = {
    totalScore: 680,
    maxScore: 720,
    correct: 172,
    wrong: 8,
    unattempted: 0,
    accuracy: 95.5,
    percentile: 99.8,
    rank: 1245
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Test Submitted Successfully!</h1>
        <p className="text-slate-500 text-lg">Here is your detailed performance analysis.</p>
      </div>

      <div className="glass-panel p-8 rounded-3xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
        
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-2xl font-semibold mb-2">Total Score</h2>
            <div className="text-6xl font-black text-primary mb-2">
              {data.totalScore} <span className="text-2xl text-slate-400 font-medium">/ {data.maxScore}</span>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300">Estimated Rank: <strong>#{data.rank}</strong></p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-green-500 mb-1">{data.correct}</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Correct</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-red-500 mb-1">{data.wrong}</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Incorrect</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-1">{data.accuracy}%</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Accuracy</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
              <div className="text-3xl font-bold text-purple-500 mb-1">{data.percentile}</div>
              <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Percentile</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <Link to="/dashboard" className="px-8 py-4 rounded-xl bg-slate-200 dark:bg-slate-800 font-semibold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
          Back to Dashboard
        </Link>
        <button className="px-8 py-4 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors">
          Download PDF Report
        </button>
      </div>
    </div>
  );
}`,
  'pages/Login.jsx': `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in');
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to log in with Google');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-panel max-w-md w-full space-y-8 p-10 rounded-3xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">Sign in to your account</h2>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <input type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all">
              Sign in
            </button>
          </div>
          
          <div className="mt-4">
            <button type="button" onClick={handleGoogleSignIn} className="w-full flex justify-center py-3 px-4 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Sign in with Google
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
            Don't have an account? <Link to="/register" className="font-medium text-primary hover:text-primary/80">Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}`,
  'pages/Register.jsx': `import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account');
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="glass-panel max-w-md w-full space-y-8 p-10 rounded-3xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">Create an account</h2>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input type="email" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <input type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div>
              <input type="password" required className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-700 placeholder-slate-500 text-slate-900 dark:text-white dark:bg-slate-800 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm" placeholder="Confirm Password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </div>
          </div>

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg shadow-primary/30 transition-all">
              Sign Up
            </button>
          </div>
          <div className="text-center mt-4 text-sm text-slate-600 dark:text-slate-400">
            Already have an account? <Link to="/login" className="font-medium text-primary hover:text-primary/80">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
}`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(projectDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log('Frontend files generated successfully.');
