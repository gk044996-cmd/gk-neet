import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

export default function Leaderboard({ isAdmin }) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = isAdmin ? `${API_URL}/api/admin/leaderboard` : `${API_URL}/api/users/leaderboard`;
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaders(data.filter(u => u.totalAttempted > 0)); // Ensure only active users are shown
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0 mins';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const getMedalColor = (index) => {
    if (index === 0) return 'from-yellow-400 via-amber-400 to-yellow-600 border-yellow-300 shadow-yellow-500/40 text-yellow-900';
    if (index === 1) return 'from-slate-300 via-slate-200 to-slate-400 border-slate-300 shadow-slate-500/30 text-slate-800';
    if (index === 2) return 'from-orange-600 via-orange-500 to-orange-700 border-orange-500 shadow-orange-900/40 text-orange-50';
    return '';
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🏆';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-6">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">Global Rankings</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Hall of Fame
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Top performers ranked by highest score and accuracy across all NEET mock tests.
        </motion.p>
      </div>

      {/* Podium Section */}
      <div className="flex flex-col md:flex-row justify-center items-end gap-6 mb-20 px-2 md:h-80">
        {/* Silver */}
        {top3[1] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`order-2 md:order-1 w-full md:w-1/3 bg-gradient-to-br ${getMedalColor(1)} p-6 rounded-t-3xl rounded-b-xl shadow-2xl border-t-[6px] text-center transform relative flex flex-col items-center justify-end h-[280px]`}>
            <div className="absolute -top-8 text-5xl drop-shadow-xl">{getMedalEmoji(1)}</div>
            <h3 className="text-2xl font-black mb-1 truncate w-full px-2">{top3[1].name}</h3>
            {top3[1].isPremium && <span className="inline-flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">Premium</span>}
            <div className="bg-white/40 rounded-2xl p-4 backdrop-blur-md w-full shadow-inner mb-4">
              <div className="text-4xl font-black mb-1 drop-shadow-sm">{top3[1].highestScore}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Score</div>
            </div>
            <div className="flex gap-4 text-sm font-bold opacity-90">
              <span>🎯 {Math.round(top3[1].accuracy)}%</span>
              <span>✅ {top3[1].correctAnswers}</span>
            </div>
          </motion.div>
        )}

        {/* Gold */}
        {top3[0] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`order-1 md:order-2 w-full md:w-1/3 bg-gradient-to-br ${getMedalColor(0)} p-8 rounded-t-3xl rounded-b-xl shadow-2xl border-t-[8px] text-center relative z-10 flex flex-col items-center justify-end h-[340px]`}>
            <div className="absolute -top-12 text-7xl drop-shadow-2xl animate-bounce">{getMedalEmoji(0)}</div>
            <div className="absolute -top-4 right-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg animate-pulse">#1 Rank</div>
            <h3 className="text-3xl font-black mb-1 truncate w-full px-2">{top3[0].name}</h3>
            {top3[0].isPremium && <span className="inline-flex items-center justify-center px-3 py-1 mb-4 rounded-full bg-amber-900 text-amber-100 text-[10px] font-bold uppercase tracking-wider shadow-md border border-amber-500/30">👑 Premium</span>}
            <div className="bg-white/40 rounded-3xl p-6 backdrop-blur-md w-full shadow-inner mb-6">
              <div className="text-5xl font-black mb-1 drop-shadow-md">{top3[0].highestScore}</div>
              <div className="text-xs font-black uppercase tracking-widest opacity-80">Highest Score</div>
            </div>
            <div className="flex gap-4 text-sm font-black opacity-90">
              <span>🎯 {Math.round(top3[0].accuracy)}%</span>
              <span>✅ {top3[0].correctAnswers}</span>
            </div>
          </motion.div>
        )}

        {/* Bronze */}
        {top3[2] && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className={`order-3 md:order-3 w-full md:w-1/3 bg-gradient-to-br ${getMedalColor(2)} p-6 rounded-t-3xl rounded-b-xl shadow-2xl border-t-[6px] text-center transform relative flex flex-col items-center justify-end h-[250px]`}>
            <div className="absolute -top-8 text-5xl drop-shadow-xl">{getMedalEmoji(2)}</div>
            <h3 className="text-xl font-black mb-1 truncate w-full px-2">{top3[2].name}</h3>
            {top3[2].isPremium && <span className="inline-flex items-center justify-center px-3 py-1 mb-3 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider shadow-md">Premium</span>}
            <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-md w-full shadow-inner mb-4">
              <div className="text-3xl font-black mb-1 drop-shadow-sm">{top3[2].highestScore}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-80">Score</div>
            </div>
            <div className="flex gap-4 text-sm font-bold opacity-90">
              <span>🎯 {Math.round(top3[2].accuracy)}%</span>
              <span>✅ {top3[2].correctAnswers}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Rest of the Leaderboard */}
      {rest.length > 0 && (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden relative">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Rank</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest">Aspirant</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Score</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center">Acc</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center hidden sm:table-cell">Correct</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center hidden md:table-cell">Wrong</th>
                  <th className="px-6 py-5 text-xs font-black text-slate-500 uppercase tracking-widest text-center hidden lg:table-cell">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/30">
                {rest.map((user, idx) => (
                  <motion.tr variants={itemVariants} key={user._id} className={`group hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors ${user.isPremium ? 'bg-amber-50/10 dark:bg-amber-900/5' : ''}`}>
                    <td className="px-6 py-4">
                      <span className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform">
                        {idx + 4}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        {user.name}
                        {user.isPremium && <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm" title="Premium User">PREMIUM</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{user.totalAttempted} Tests Attempted</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 drop-shadow-sm">{user.highestScore}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                        {Math.round(user.accuracy)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-emerald-600 dark:text-emerald-400 hidden sm:table-cell">
                      {user.correctAnswers}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-rose-500 dark:text-rose-400 hidden md:table-cell">
                      {user.wrongAnswers}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-500 dark:text-slate-400 hidden lg:table-cell">
                      {formatTime(user.timeTaken)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
