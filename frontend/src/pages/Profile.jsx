import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { User, Award, Flame, Target, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${API_URL}/api/tests/my-results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await res.json();
        
        const completedResults = data.filter(r => r.completed);
        const totalTests = completedResults.length;
        const highestScore = totalTests > 0 ? Math.max(...completedResults.map(r => r.score || 0)) : 0;
        
        const totalCorrect = completedResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
        const totalWrong = completedResults.reduce((acc, r) => acc + (r.wrongCount || 0), 0);
        const totalAttempted = totalCorrect + totalWrong;
        const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        
        const chronological = [...completedResults].reverse().slice(-5);
        const graphData = chronological.map((r, i) => ({
          name: r.testId?.title ? r.testId.title.substring(0, 8) + '...' : `T${i+1}`,
          score: r.score
        }));

        let recommendations = [];
        if (totalTests === 0) {
          recommendations.push("Start taking mock tests to see study recommendations here.");
        } else if (accuracy < 50) {
          recommendations.push("Focus on revising core concepts to improve accuracy.");
        } else {
          recommendations.push("Great accuracy! Keep maintaining this pace.");
        }

        setAnalytics({
          streak: totalTests > 0 ? 1 : 0,
          accuracy,
          totalTests,
          highestScore,
          graphData,
          recommendations
        });
      } catch (err) {
        console.error("Failed to fetch profile data", err);
        setError(err.message || 'An unexpected error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30">
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <SEO title="My Profile" description="View your detailed NEET performance profile." />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Profile Card */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-8 rounded-[2rem] text-center relative overflow-hidden group">
            {currentUser?.isPremium && (
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/20 blur-3xl rounded-full"></div>
            )}
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className={`absolute inset-0 rounded-full blur-xl opacity-50 ${currentUser?.isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-500'}`}></div>
              <div className={`relative w-full h-full rounded-full flex items-center justify-center text-4xl bg-white dark:bg-slate-900 border-4 ${currentUser?.isPremium ? 'border-amber-400' : 'border-indigo-100 dark:border-indigo-900'}`}>
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {currentUser?.isPremium && (
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-full p-1 shadow-md">
                  <span className="text-2xl" title="Premium User">👑</span>
                </div>
              )}
            </div>
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
              {currentUser?.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">@{currentUser?.username || 'user'}</p>
            
            {currentUser?.isPremium ? (
              <div className="bg-gradient-to-r from-amber-400/10 to-orange-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 p-4 rounded-2xl">
                <p className="text-sm font-bold uppercase tracking-wider mb-1">Premium Member</p>
                {currentUser.premiumExpiresAt && (
                  <p className="text-xs font-semibold opacity-80">Valid until {new Date(currentUser.premiumExpiresAt).toLocaleDateString()}</p>
                )}
              </div>
            ) : (
              <button onClick={() => navigate('/premium')} className="w-full py-3 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl border border-slate-300 dark:border-slate-600 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                <span>⭐</span> Upgrade to Premium
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-8 rounded-[2rem]">
            <h3 className="font-black mb-6 flex items-center gap-3 text-xl text-slate-900 dark:text-white">
              <Target className="text-indigo-500" /> Study Recommendations
            </h3>
            <ul className="space-y-4 text-sm font-medium">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-4 bg-indigo-50/50 dark:bg-indigo-900/20 text-slate-700 dark:text-slate-300 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800/30 shadow-sm transition-transform hover:-translate-y-1">
                  <span className="shrink-0 text-xl">💡</span> <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Stats & Graphs */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: 'Day Streak', value: analytics.streak, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20' },
              { label: 'Tests Attempted', value: analytics.totalTests, icon: Award, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20' },
              { label: 'Avg Accuracy', value: `${analytics.accuracy}%`, icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
              { label: 'Highest Score', value: analytics.highestScore, icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20' }
            ].map((stat, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className={`bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-6 rounded-[2rem] text-center flex flex-col items-center justify-center relative overflow-hidden group`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-8 rounded-[2rem] min-h-[400px]">
            <h3 className="text-xl font-black mb-8 text-slate-900 dark:text-white">Progress History (Last 5 Tests)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.graphData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
                  <YAxis domain={[0, 720]} stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.9)', color: '#fff', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', backdropFilter: 'blur(10px)', padding: '12px' }} 
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }} 
                    cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4', opacity: 0.4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="url(#colorScore)" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#6366f1', strokeWidth: 3, stroke: '#fff' }} 
                    activeDot={{ r: 8, strokeWidth: 0, fill: '#8b5cf6' }} 
                    animationDuration={1500}
                  />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
