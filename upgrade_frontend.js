const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'frontend', 'src');

const files = {
  'App.jsx': `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MockTest from './pages/MockTest';
import Result from './pages/Result';
import PYQ from './pages/PYQ';
import ChapterTests from './pages/ChapterTests';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import Bookmarks from './pages/Bookmarks';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 font-sans transition-colors duration-200 pb-16 md:pb-0">
            <Navbar />
            <main className="flex-grow pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/test/:id" element={<MockTest />} />
                <Route path="/result/:id" element={<Result />} />
                <Route path="/pyq" element={<PYQ />} />
                <Route path="/chapter-tests" element={<ChapterTests />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/bookmarks" element={<Bookmarks />} />
              </Routes>
            </main>
            <BottomNav />
            <div className="hidden md:block"><Footer /></div>
          </div>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
`,
  'components/BottomNav.jsx': `import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const links = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'PYQ', path: '/pyq', icon: BookOpen },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Alerts', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.path;
        return (
          <Link key={link.name} to={link.path} className={\`flex flex-col items-center justify-center w-full h-full \${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}\`}>
            <Icon size={20} className={\`\${isActive ? 'fill-primary/20' : ''}\`} />
            <span className="text-[10px] mt-1 font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
`,
  'components/SEO.jsx': `import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description }) {
  return (
    <Helmet>
      <title>{title} | GK NEET MOCK</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
`,
  'pages/PYQ.jsx': `import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Search, Filter } from 'lucide-react';

export default function PYQ() {
  const [searchTerm, setSearchTerm] = useState('');

  const pyqYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Previous Year Questions" description="Practice NEET Previous Year Questions (PYQ) year-wise and chapter-wise." />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Previous Year Questions</h1>
          <p className="text-slate-500">Practice actual NTA NEET papers from past years.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search year or subject..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pyqYears.map(year => (
          <div key={year} className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-primary">NEET {year}</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Official Paper</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Complete 180 questions with NTA answer key solutions.</p>
            <div className="mt-auto flex gap-3">
              <button className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">Attempt Exam</button>
              <button className="flex-1 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
  'pages/ChapterTests.jsx': `import React from 'react';
import SEO from '../components/SEO';
import { BookOpen } from 'lucide-react';

export default function ChapterTests() {
  const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Chapter Tests" description="Practice subject-wise and chapter-wise mini mock tests." />
      <h1 className="text-3xl font-bold mb-2">Chapter-wise Practice</h1>
      <p className="text-slate-500 mb-8">Focus on your weak areas with mini mock tests.</p>

      {subjects.map(sub => (
        <div key={sub} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-primary"/> {sub}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-panel p-5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-semibold mb-1">Important Chapter {i}</h4>
                  <p className="text-xs text-slate-500">50 Questions • 45 Mins</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
`,
  'pages/Profile.jsx': `import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { User, Award, Flame, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Mock analytics fetch
    setAnalytics({
      streak: 5,
      accuracy: 88,
      totalTests: 24,
      graphData: [
        { name: 'T1', score: 450 }, { name: 'T2', score: 520 }, 
        { name: 'T3', score: 490 }, { name: 'T4', score: 580 }, 
        { name: 'T5', score: 610 }
      ],
      recommendations: ["Focus on Physics Mechanics.", "Great accuracy in Zoology!"]
    });
  }, []);

  if(!analytics) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="My Profile" description="View your detailed NEET performance profile." />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col - Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl text-center">
            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{currentUser?.displayName || 'NEET Aspirant'}</h2>
            <p className="text-slate-500">{currentUser?.email}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="text-primary" /> AI Recommendations</h3>
            <ul className="space-y-3 text-sm">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span>💡</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col - Stats */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Flame className="mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-black">{analytics.streak}</div>
              <div className="text-xs text-slate-500">Day Streak</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Award className="mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-black">{analytics.totalTests}</div>
              <div className="text-xs text-slate-500">Tests Attempted</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Target className="mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-black">{analytics.accuracy}%</div>
              <div className="text-xs text-slate-500">Avg Accuracy</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <User className="mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-black">610</div>
              <div className="text-xs text-slate-500">Highest Score</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold mb-6">Progress History (Last 5 Tests)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[0, 720]} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
`,
  'pages/Notifications.jsx': `import React from 'react';
import SEO from '../components/SEO';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const notifs = [
    { id: 1, title: 'Exam Reminder', msg: 'NEET Full Mock 4 is scheduled for tomorrow.', type: 'reminder', time: '2h ago' },
    { id: 2, title: 'Result Published', msg: 'Your results for Biology Chapter Test are ready.', type: 'alert', time: '1d ago' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="Notifications" description="View your alerts and reminders." />
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><Bell /> Notifications</h1>
      
      <div className="space-y-4">
        {notifs.map(n => (
          <div key={n.id} className="glass-panel p-5 rounded-2xl flex gap-4 items-start">
            <div className={\`p-3 rounded-full \${n.type === 'reminder' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}\`}>
              {n.type === 'reminder' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{n.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{n.msg}</p>
              <span className="text-xs text-slate-400 mt-2 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
`,
  'pages/Bookmarks.jsx': `import React from 'react';
import SEO from '../components/SEO';
import { Bookmark } from 'lucide-react';

export default function Bookmarks() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO title="Bookmarked Questions" description="Review your saved difficult questions." />
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Bookmark /> Bookmarks</h1>
      <p className="text-slate-500 mb-8">Revise your saved difficult questions here.</p>
      
      <div className="glass-panel p-10 rounded-3xl text-center">
        <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
        <p className="text-slate-500">Star questions during your mock tests to save them here for quick revision.</p>
      </div>
    </div>
  );
}
`,
  'pages/MockTest.jsx': `import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { AlertTriangle, Maximize, X } from 'lucide-react';

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
  const [timeLeft, setTimeLeft] = useState(180 * 60);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [started, setStarted] = useState(false);

  // Security & Anti-cheat measures
  useEffect(() => {
    if (!started) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(w => {
          const newW = w + 1;
          alert(\`Warning \${newW}/3: Tab switching is not allowed during the exam.\`);
          if (newW >= 3) handleSubmit(true);
          return newW;
        });
      }
    };

    const preventCopy = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', preventCopy);
    document.addEventListener('copy', preventCopy);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', preventCopy);
      document.removeEventListener('copy', preventCopy);
    };
  }, [started]);

  // Timer
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [started]);

  const requestFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
    setIsFullscreen(true);
  };

  const startExam = () => {
    requestFullscreen();
    setStarted(true);
  };

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return \`\${h.toString().padStart(2, '0')}:\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
  };

  const handleSubmit = useCallback((force = false) => {
    if(force || window.confirm('Are you sure you want to submit the test?')) {
      if(document.fullscreenElement) document.exitFullscreen();
      navigate(\`/result/\${id}\`);
    }
  }, [id, navigate]);

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <SEO title="Exam Instructions" />
        <div className="glass-panel p-8 rounded-3xl">
          <h1 className="text-3xl font-bold mb-6 text-center">NTA Mock Test Instructions</h1>
          <div className="space-y-4 mb-8 text-slate-600 dark:text-slate-300">
            <p>1. The exam is of 180 minutes duration.</p>
            <p>2. There are 180 questions in total. Each correct answer awards 4 marks, wrong answer deducts 1 mark.</p>
            <p className="text-red-500 font-bold flex items-center gap-2"><AlertTriangle size={20}/> 3. Do not switch tabs. 3 warnings will lead to auto-submit.</p>
            <p>4. Exam will run in fullscreen mode.</p>
          </div>
          <button onClick={startExam} className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary/90 flex justify-center items-center gap-2 shadow-lg shadow-primary/30">
            <Maximize size={20} /> I have read the instructions. Begin Exam
          </button>
        </div>
      </div>
    );
  }

  const currentQ = MOCK_QUESTIONS[currentQIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-900 select-none">
      <SEO title="Mock Test Active" />
      {/* NTA Header */}
      <header className="bg-[#1e40af] text-white px-6 py-3 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="font-bold text-xl tracking-wider">NTA NEET MOCK</div>
          <div className="hidden md:flex gap-2">
            {['Physics', 'Chemistry', 'Botany', 'Zoology'].map(sub => (
              <span key={sub} className={\`px-3 py-1 text-sm rounded cursor-pointer \${currentQ.subject === sub ? 'bg-white text-[#1e40af] font-bold' : 'hover:bg-blue-700'}\`}>
                {sub}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-sm opacity-80">Time Left</div>
            <div className={\`text-2xl font-mono font-bold \${timeLeft < 600 ? 'text-red-300 animate-pulse' : ''}\`}>
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 md:p-8 shadow-sm h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold">Question {currentQIndex + 1}</h2>
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-green-600">+4 marks</span>
                <span className="text-sm font-semibold text-red-500">-1 mark</span>
              </div>
            </div>
            <p className="text-lg mb-8 font-medium">{currentQ.text}</p>
            <div className="space-y-4 flex-grow">
              {currentQ.options.map((opt, i) => (
                <label key={i} className={\`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all \${answers[currentQIndex] === i ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 hover:border-blue-200'}\`}>
                  <input type="radio" name={\`question-\${currentQIndex}\`} className="w-5 h-5 text-blue-600 focus:ring-blue-500" checked={answers[currentQIndex] === i} onChange={() => setAnswers({ ...answers, [currentQIndex]: i })} />
                  <span className="ml-4 text-lg">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* NTA Palette */}
        <div className="w-full md:w-[320px] bg-slate-50 dark:bg-slate-800 border-l border-slate-200 flex flex-col h-64 md:h-auto">
          <div className="p-4 bg-white dark:bg-slate-800 border-b">
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold">
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-green-500 text-white flex items-center justify-center">1</div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-red-500 text-white flex items-center justify-center">2</div> Not Answered</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 flex items-center justify-center">3</div> Not Visited</div>
              <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-md bg-purple-500 text-white flex items-center justify-center">4</div> Marked Review</div>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto grid grid-cols-5 gap-2 content-start bg-slate-100 dark:bg-slate-900">
            {MOCK_QUESTIONS.map((_, i) => {
              let bg = "bg-slate-200 text-slate-700";
              if (answers[i] !== undefined) bg = "bg-green-500 text-white";
              else if (markedForReview[i]) bg = "bg-purple-500 text-white";
              else if (i === currentQIndex) bg = "bg-red-500 text-white border-2 border-black"; 

              return (
                <button key={i} onClick={() => setCurrentQIndex(i)} className={\`w-10 h-10 rounded-md flex items-center justify-center font-bold text-sm shadow-sm \${bg}\`}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* NTA Footer Controls */}
      <footer className="bg-slate-200 dark:bg-slate-800 px-4 py-3 flex flex-wrap justify-between items-center gap-2 shadow-inner">
        <div className="flex gap-2">
          <button onClick={() => { setMarkedForReview({ ...markedForReview, [currentQIndex]: true }); setCurrentQIndex(Math.min(MOCK_QUESTIONS.length-1, currentQIndex+1)); }} className="px-4 py-2 bg-purple-600 text-white rounded font-semibold text-sm hover:bg-purple-700">Mark for Review & Next</button>
          <button onClick={() => { const newA = {...answers}; delete newA[currentQIndex]; setAnswers(newA); }} className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded font-semibold text-sm hover:bg-slate-50">Clear Response</button>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))} disabled={currentQIndex === 0} className="px-6 py-2 bg-white border border-slate-300 rounded font-semibold text-sm disabled:opacity-50 hover:bg-slate-50">Previous</button>
          <button onClick={() => setCurrentQIndex(Math.min(MOCK_QUESTIONS.length-1, currentQIndex+1))} className="px-8 py-2 bg-green-600 text-white rounded font-semibold text-sm hover:bg-green-700 shadow-md">Save & Next</button>
          <button onClick={() => handleSubmit(false)} className="px-6 py-2 bg-[#1e40af] text-white rounded font-bold text-sm hover:bg-blue-800 shadow-md ml-4">Submit</button>
        </div>
      </footer>
    </div>
  );
}
`
};

Object.entries(files).forEach(([filePath, content]) => {
  const fullPath = path.join(projectDir, filePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
});

console.log('Frontend upgrade files generated successfully.');
