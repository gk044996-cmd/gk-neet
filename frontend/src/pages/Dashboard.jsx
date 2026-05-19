import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [myResults, setMyResults] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch(`${API_URL}/api/tests/my-results`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/users/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
    .then(([resultsData, rankData]) => {
      setMyResults(resultsData);
      const currentUserId = currentUser?._id || currentUser?.id;
      const rankIndex = rankData.findIndex(u => u._id === currentUserId);
      setMyRank(rankIndex !== -1 ? rankIndex + 1 : 'Not Attempted');
    })
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [currentUser]);

  const totalTests = myResults.length;
  const highestScore = totalTests > 0 ? Math.max(...myResults.map(r => r.score || 0)) : 0;
  const averageScore = totalTests > 0 ? Math.round(myResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests) : 0;
  
  const totalCorrect = myResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
  const totalWrong = myResults.reduce((acc, r) => acc + (r.wrongCount || 0), 0);
  const totalAttempted = totalCorrect + totalWrong;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <motion.div initial="hidden" animate="show" variants={containerVars}>
        
        {/* Header */}
        <motion.div variants={itemVars} className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              Hello, {currentUser?.name?.split(' ')[0] || 'Aspirant'}
              {currentUser?.isPremium && <span className="text-2xl" title="Premium Member">👑</span>}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Ready to conquer your next mock test?</p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {totalTests === 0 ? (
          <motion.div variants={itemVars} className="bg-indigo-50 dark:bg-indigo-900/20 backdrop-blur-sm p-10 rounded-3xl text-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🚀</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Begin Your Journey</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-6">Attempt your first mock test to unlock detailed analytics, rank tracking, and performance insights.</p>
            <a href="#tests" className="inline-block px-8 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-colors">View Available Tests</a>
          </motion.div>
        ) : (
          <motion.div variants={itemVars} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6 mb-12">
            {/* Rank Card */}
            <div className="col-span-2 lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 sm:p-8 rounded-[2rem] text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <h3 className="text-indigo-100 mb-2 font-bold uppercase tracking-widest text-sm opacity-90">National Rank</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl sm:text-6xl font-black leading-none">{myRank}</span>
                {typeof myRank === 'number' && <span className="text-indigo-200 font-bold mb-1">/ {myRank > 1000 ? '10k+' : 'All'}</span>}
              </div>
            </div>
            
            {/* Stat Cards */}
            {[
              { label: 'Highest', value: highestScore, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-white dark:bg-slate-800' },
              { label: 'Average', value: averageScore, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-white dark:bg-slate-800' },
              { label: 'Accuracy', value: `${accuracy}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-white dark:bg-slate-800' },
              { label: 'Attempted', value: totalTests, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-white dark:bg-slate-800' }
            ].map((stat, i) => (
              <div key={i} className={`${stat.bg} p-6 rounded-[2rem] border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-center`}>
                <h3 className="text-slate-500 dark:text-slate-400 mb-2 text-xs font-bold uppercase tracking-wider">{stat.label}</h3>
                <p className={`text-3xl sm:text-4xl font-black ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Informative Sections */}
        <div className="mt-16 space-y-12">
          {/* About Our Platform */}
          <motion.section variants={itemVars} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-4">
              <span className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl text-indigo-600 dark:text-indigo-400">🎯</span>
              About Our Platform
            </h2>
            <div className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed space-y-4 max-w-4xl relative z-10">
              <p>Welcome to India's most advanced <strong>NEET preparation platform</strong>. We are dedicated to providing medical aspirants with the most realistic, NTA-compliant mock test experience available today.</p>
              <p>Through our comprehensive performance tracking and premium analytics, you can pinpoint your exact weaknesses, perfect your time management, and step into the examination hall with absolute confidence.</p>
              <div className="mt-8 pt-4">
                <Link to="/tests" className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-1">
                  Explore Mock Tests
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>
          </motion.section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Exam Instructions */}
            <motion.section variants={itemVars} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800/80 dark:to-slate-800/80 backdrop-blur-xl border border-amber-200/50 dark:border-slate-700/50 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">📋</span> Exam Instructions
              </h2>
              <ul className="space-y-4">
                {[
                  "Follow the timer carefully; tests auto-submit when time expires.",
                  "Avoid tab switching. Our anti-cheat system will flag violations.",
                  "Ensure a stable internet connection before starting.",
                  "Use the 'Mark for Review' feature for doubtful questions.",
                  "Always review your answers before clicking final submit."
                ].map((instruction, idx) => (
                  <li key={idx} className="flex gap-3 text-slate-700 dark:text-slate-300 font-medium">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-amber-200 dark:bg-slate-700 text-amber-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold mt-0.5">{idx + 1}</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            {/* Why Choose Us */}
            <motion.section variants={itemVars} className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/80 backdrop-blur-xl border border-emerald-200/50 dark:border-slate-700/50 rounded-[2rem] p-8 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <span className="text-2xl">🚀</span> Why Choose Us
              </h2>
              <ul className="space-y-4">
                {[
                  { icon: "📱", text: "100% Mobile-friendly platform for on-the-go study" },
                  { icon: "📊", text: "Detailed subject-wise analytics & accuracy tracking" },
                  { icon: "💎", text: "Premium exclusive mock tests updated weekly" },
                  { icon: "🏆", text: "Global leaderboard system to rank among peers" },
                  { icon: "⚡", text: "Lightning fast performance with no lagging" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-emerald-100 dark:border-slate-700/50">
                    <span className="shrink-0 text-xl">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Platform Features Grid */}
          <motion.section variants={itemVars} className="pt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-8 text-center">Core Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "NTA UI Pattern", desc: "Exact replica of official exam interface", color: "bg-blue-500" },
                { title: "Smart Evaluation", desc: "Instant scoring & negative marking", color: "bg-purple-500" },
                { title: "PYQ Integration", desc: "Previous year questions included", color: "bg-emerald-500" },
                { title: "Secure Testing", desc: "Advanced anti-cheat mechanisms", color: "bg-rose-500" }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[1.5rem] p-6 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                  <div className={`absolute -right-6 -top-6 w-24 h-24 ${feature.color} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform`}></div>
                  <div className={`w-3 h-12 ${feature.color} absolute left-0 top-6 rounded-r-full`}></div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 pl-4">{feature.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium pl-4">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </motion.div>
    </div>
  );
}