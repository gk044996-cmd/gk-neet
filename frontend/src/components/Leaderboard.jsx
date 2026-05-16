import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/users/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeaders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading leaderboard...</div>;

  const top3 = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  const getMedalColor = (index) => {
    if (index === 0) return 'from-yellow-300 to-yellow-500 border-yellow-400 text-yellow-900 shadow-yellow-500/30';
    if (index === 1) return 'from-slate-300 to-slate-400 border-slate-400 text-slate-800 shadow-slate-500/20';
    if (index === 2) return 'from-amber-600 to-amber-700 border-amber-700 text-amber-50 shadow-amber-900/30';
    return '';
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">Platform Leaderboard</h1>
        <p className="text-slate-500 text-lg">Top performers ranked by highest score and accuracy.</p>
      </div>

      {/* Top 3 Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end">
        {/* Silver */}
        {top3[1] && (
          <div className={`order-2 md:order-1 bg-gradient-to-b ${getMedalColor(1)} p-6 rounded-3xl shadow-xl border-t-4 text-center transform hover:-translate-y-2 transition-transform`}>
            <div className="text-5xl mb-4">{getMedalEmoji(1)}</div>
            <h3 className="text-2xl font-bold mb-1">{top3[1].name}</h3>
            <p className="opacity-80 font-semibold mb-4">Rank #2</p>
            <div className="bg-white/30 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-black mb-1">{top3[1].highestScore}</div>
              <div className="text-sm font-semibold uppercase tracking-widest opacity-80">Score</div>
            </div>
            <div className="mt-4 flex flex-wrap justify-around text-xs font-bold gap-2">
              <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded">✅ {top3[1].correctAnswers}</span>
              <span className="text-rose-700 bg-rose-100 px-2 py-1 rounded">❌ {top3[1].wrongAnswers}</span>
              <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded">⏱ {Math.round(top3[1].timeTaken / 60)}m</span>
              <span className="text-purple-700 bg-purple-100 px-2 py-1 rounded">🎯 {Math.round(top3[1].accuracy)}%</span>
            </div>
          </div>
        )}

        {/* Gold */}
        {top3[0] && (
          <div className={`order-1 md:order-2 bg-gradient-to-b ${getMedalColor(0)} p-8 rounded-3xl shadow-2xl border-t-4 text-center transform -translate-y-4 hover:-translate-y-6 transition-transform relative z-10`}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-sm">Champion</div>
            <div className="text-6xl mb-4">{getMedalEmoji(0)}</div>
            <h3 className="text-3xl font-black mb-1">{top3[0].name}</h3>
            <p className="opacity-80 font-bold mb-6">Rank #1</p>
            <div className="bg-white/40 rounded-xl p-6 backdrop-blur-sm shadow-inner">
              <div className="text-5xl font-black mb-1">{top3[0].highestScore}</div>
              <div className="text-sm font-bold uppercase tracking-widest opacity-80">Highest Score</div>
            </div>
            <div className="mt-6 flex flex-wrap justify-around text-sm font-black gap-2">
              <span className="text-emerald-800 bg-emerald-100 px-3 py-1 rounded">✅ {top3[0].correctAnswers} Correct</span>
              <span className="text-rose-800 bg-rose-100 px-3 py-1 rounded">❌ {top3[0].wrongAnswers} Wrong</span>
              <span className="text-blue-800 bg-blue-100 px-3 py-1 rounded">⏱ {Math.round(top3[0].timeTaken / 60)} mins</span>
              <span className="text-purple-800 bg-purple-100 px-3 py-1 rounded">🎯 {Math.round(top3[0].accuracy)}% Acc</span>
            </div>
          </div>
        )}

        {/* Bronze */}
        {top3[2] && (
          <div className={`order-3 md:order-3 bg-gradient-to-b ${getMedalColor(2)} p-6 rounded-3xl shadow-xl border-t-4 text-center transform hover:-translate-y-2 transition-transform`}>
            <div className="text-5xl mb-4">{getMedalEmoji(2)}</div>
            <h3 className="text-2xl font-bold mb-1">{top3[2].name}</h3>
            <p className="opacity-80 font-semibold mb-4">Rank #3</p>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
              <div className="text-3xl font-black mb-1">{top3[2].highestScore}</div>
              <div className="text-sm font-semibold uppercase tracking-widest opacity-80">Score</div>
            </div>
            <div className="mt-4 flex flex-wrap justify-around text-xs font-bold gap-2">
              <span className="text-emerald-700 bg-emerald-100 px-2 py-1 rounded">✅ {top3[2].correctAnswers}</span>
              <span className="text-rose-700 bg-rose-100 px-2 py-1 rounded">❌ {top3[2].wrongAnswers}</span>
              <span className="text-blue-700 bg-blue-100 px-2 py-1 rounded">⏱ {Math.round(top3[2].timeTaken / 60)}m</span>
              <span className="text-purple-700 bg-purple-100 px-2 py-1 rounded">🎯 {Math.round(top3[2].accuracy)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the Leaderboard */}
      {rest.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Accuracy</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Correct</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Wrong</th>
                <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {rest.map((user, idx) => (
                <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-5">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                      {idx + 4}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{user.highestScore}</span>
                  </td>
                  <td className="px-6 py-5 font-semibold text-emerald-600">
                    {Math.round(user.accuracy)}%
                  </td>
                  <td className="px-6 py-5 font-medium text-emerald-500">
                    {user.correctAnswers}
                  </td>
                  <td className="px-6 py-5 font-medium text-rose-500">
                    {user.wrongAnswers}
                  </td>
                  <td className="px-6 py-5 font-medium text-blue-500">
                    {Math.round(user.timeTaken / 60)}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
