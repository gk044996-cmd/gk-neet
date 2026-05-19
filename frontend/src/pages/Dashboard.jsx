import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    Promise.all([
      fetch(`${API_URL}/api/tests`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/tests/my-results`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_URL}/api/users/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } }).then(r => r.json())
    ])
    .then(([testsData, resultsData, rankData]) => {
      setTests(testsData);
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
          {!currentUser?.isPremium && (
            <Link to="/premium" className="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white font-bold shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform">
              <span className="mr-2">⭐</span> Upgrade to Premium
            </Link>
          )}
        </motion.div>

        {/* Stats Grid */}
        {totalTests === 0 ? (
          <motion.div variants={itemVars} className="bg-indigo-50 dark:bg-indigo-900/20 backdrop-blur-sm p-10 rounded-3xl text-center border border-indigo-100 dark:border-indigo-800/50 shadow-sm mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-cyan-500"></div>
            <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">🚀</div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Begin Your Journey</h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-6">Attempt your first mock test to unlock detailed AI analytics, rank tracking, and performance insights.</p>
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

        {/* Tests Section */}
        <motion.div variants={itemVars} id="tests" className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Active Mock Tests</h2>
        </motion.div>

        <motion.div variants={containerVars} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {tests.map(test => {
            const attempt = myResults.find(r => r.testId && r.testId._id === test._id);
            const isPremiumLocked = test.accessType === 'premium' && !currentUser?.isPremium && currentUser?.role !== 'admin';
            
            return (
              <motion.div variants={itemVars} key={test._id} className="group flex flex-col bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden">
                {/* Premium Glow */}
                {test.accessType === 'premium' && <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/20 blur-3xl rounded-full"></div>}
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                    {test.title}
                  </h3>
                  {test.accessType === 'premium' && (
                    <span className="shrink-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shadow-sm ml-3">
                      Premium
                    </span>
                  )}
                </div>

                <div className="flex gap-4 mb-6 relative z-10">
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400">📝</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{test.totalQuestions || test.questions?.length || 0} Qs</span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-700/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-600 flex items-center gap-1.5">
                    <span className="text-slate-400">⏱</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{test.duration}m</span>
                  </div>
                </div>
                
                <div className="mt-auto relative z-10">
                  {attempt ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
                          <p className="font-black text-slate-800 dark:text-white">{attempt.score} <span className="text-slate-400 text-sm">/ {test.totalMarks}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</p>
                          <p className="font-black text-emerald-500">{Math.round(attempt.accuracy)}%</p>
                        </div>
                      </div>
                      <Link to={`/results/${attempt._id}`} className="block w-full text-center py-3.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border border-emerald-100 dark:border-emerald-800/50">
                        View Analysis
                      </Link>
                    </div>
                  ) : isPremiumLocked ? (
                    <Link to="/premium" className="block w-full text-center py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:-translate-y-0.5">
                      <span>🔒</span> Unlock Premium
                    </Link>
                  ) : (
                    <Link to={`/test/${test._id}`} className="block w-full text-center py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:-translate-y-0.5">
                      Start Test
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}