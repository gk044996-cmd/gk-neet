import React, { useState, useEffect } from 'react';
import { API_URL } from '../config';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/users/leaderboard`, {
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

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return '0 mins';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h} hr ${m} min${m !== 1 ? 's' : ''}`;
    return `${m} min${m !== 1 ? 's' : ''}`;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 items-end px-2">
        {/* Silver */}
        {top3[1] && (
          <div className={`order-2 md:order-1 bg-gradient-to-b ${getMedalColor(1)} p-6 rounded-3xl shadow-xl border-t-4 text-center transform hover:-translate-y-2 transition-all`}>
            <div className="text-5xl mb-4 drop-shadow-md">{getMedalEmoji(1)}</div>
            <h3 className="text-2xl font-bold mb-1 truncate px-2">{top3[1].name}</h3>
            <p className="opacity-90 font-semibold mb-4 tracking-wide">Rank #2</p>
            <div className="bg-white/30 rounded-xl p-4 backdrop-blur-sm mb-5 shadow-sm">
              <div className="text-4xl font-black mb-1 drop-shadow-sm">{top3[1].highestScore}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">Score</div>
            </div>
            <div className="flex flex-wrap justify-center text-xs font-bold gap-2">
              <span className="text-emerald-800 bg-emerald-100/90 dark:bg-emerald-200 px-2.5 py-1.5 rounded shadow-sm">✅ {top3[1].correctAnswers} Correct</span>
              <span className="text-rose-800 bg-rose-100/90 dark:bg-rose-200 px-2.5 py-1.5 rounded shadow-sm">❌ {top3[1].wrongAnswers} Wrong</span>
              <span className="text-slate-800 bg-slate-100/90 dark:bg-slate-200 px-2.5 py-1.5 rounded shadow-sm">📝 {top3[1].totalAttempted} Att.</span>
              <span className="text-blue-800 bg-blue-100/90 dark:bg-blue-200 px-2.5 py-1.5 rounded shadow-sm">⏱ {formatTime(top3[1].timeTaken)}</span>
              <span className="text-purple-800 bg-purple-100/90 dark:bg-purple-200 px-2.5 py-1.5 rounded shadow-sm">🎯 {Math.round(top3[1].accuracy)}%</span>
            </div>
          </div>
        )}

        {/* Gold */}
        {top3[0] && (
          <div className={`order-1 md:order-2 bg-gradient-to-b ${getMedalColor(0)} p-8 rounded-3xl shadow-2xl border-t-4 text-center transform -translate-y-4 hover:-translate-y-6 transition-all relative z-10`}>
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-800 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">Champion</div>
            <div className="text-6xl mb-4 drop-shadow-md">{getMedalEmoji(0)}</div>
            <h3 className="text-3xl font-black mb-1 truncate px-2">{top3[0].name}</h3>
            <p className="opacity-90 font-bold mb-6 tracking-wide">Rank #1</p>
            <div className="bg-white/40 rounded-xl p-6 backdrop-blur-sm shadow-inner mb-6">
              <div className="text-6xl font-black mb-1 drop-shadow-md">{top3[0].highestScore}</div>
              <div className="text-xs font-black uppercase tracking-widest opacity-90">Highest Score</div>
            </div>
            <div className="flex flex-wrap justify-center text-sm font-black gap-2.5">
              <span className="text-emerald-900 bg-emerald-100/90 dark:bg-emerald-200 px-3 py-1.5 rounded shadow-sm">✅ {top3[0].correctAnswers} Correct</span>
              <span className="text-rose-900 bg-rose-100/90 dark:bg-rose-200 px-3 py-1.5 rounded shadow-sm">❌ {top3[0].wrongAnswers} Wrong</span>
              <span className="text-slate-900 bg-slate-100/90 dark:bg-slate-200 px-3 py-1.5 rounded shadow-sm">📝 {top3[0].totalAttempted} Attempted</span>
              <span className="text-blue-900 bg-blue-100/90 dark:bg-blue-200 px-3 py-1.5 rounded shadow-sm">⏱ {formatTime(top3[0].timeTaken)}</span>
              <span className="text-purple-900 bg-purple-100/90 dark:bg-purple-200 px-3 py-1.5 rounded shadow-sm">🎯 {Math.round(top3[0].accuracy)}% Acc</span>
            </div>
          </div>
        )}

        {/* Bronze */}
        {top3[2] && (
          <div className={`order-3 md:order-3 bg-gradient-to-b ${getMedalColor(2)} p-6 rounded-3xl shadow-xl border-t-4 text-center transform hover:-translate-y-2 transition-all`}>
            <div className="text-5xl mb-4 drop-shadow-md">{getMedalEmoji(2)}</div>
            <h3 className="text-2xl font-bold mb-1 truncate px-2">{top3[2].name}</h3>
            <p className="opacity-90 font-semibold mb-4 tracking-wide">Rank #3</p>
            <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm mb-5 shadow-sm">
              <div className="text-4xl font-black mb-1 drop-shadow-sm">{top3[2].highestScore}</div>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">Score</div>
            </div>
            <div className="flex flex-wrap justify-center text-xs font-bold gap-2">
              <span className="text-emerald-100 bg-emerald-900/40 px-2.5 py-1.5 rounded shadow-sm">✅ {top3[2].correctAnswers} Correct</span>
              <span className="text-rose-100 bg-rose-900/40 px-2.5 py-1.5 rounded shadow-sm">❌ {top3[2].wrongAnswers} Wrong</span>
              <span className="text-slate-100 bg-slate-900/40 px-2.5 py-1.5 rounded shadow-sm">📝 {top3[2].totalAttempted} Att.</span>
              <span className="text-blue-100 bg-blue-900/40 px-2.5 py-1.5 rounded shadow-sm">⏱ {formatTime(top3[2].timeTaken)}</span>
              <span className="text-purple-100 bg-purple-900/40 px-2.5 py-1.5 rounded shadow-sm">🎯 {Math.round(top3[2].accuracy)}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Rest of the Leaderboard */}
      {rest.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80">
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Accuracy</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Correct</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Wrong</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Attempted</th>
                  <th className="px-6 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {rest.map((user, idx) => (
                  <tr key={user._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-5">
                      <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
                        {idx + 4}
                      </span>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-800 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">{user.highestScore}</span>
                    </td>
                    <td className="px-6 py-5 font-semibold text-emerald-600 dark:text-emerald-400">
                      {Math.round(user.accuracy)}%
                    </td>
                    <td className="px-6 py-5 font-medium text-emerald-600 dark:text-emerald-400">
                      {user.correctAnswers}
                    </td>
                    <td className="px-6 py-5 font-medium text-rose-600 dark:text-rose-400">
                      {user.wrongAnswers}
                    </td>
                    <td className="px-6 py-5 font-medium text-slate-600 dark:text-slate-400">
                      {user.totalAttempted}
                    </td>
                    <td className="px-6 py-5 font-medium text-blue-600 dark:text-blue-400">
                      {formatTime(user.timeTaken)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
