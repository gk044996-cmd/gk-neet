import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../../config';

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/admin/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500 font-bold">Loading results...</div>;

  const filteredResults = results.filter(r => {
    const q = search.toLowerCase();
    const studentName = r.userId?.username?.toLowerCase() || r.userId?.name?.toLowerCase() || '';
    const studentEmail = r.userId?.email?.toLowerCase() || '';
    const testTitle = r.testId?.title?.toLowerCase() || '';
    return studentName.includes(q) || studentEmail.includes(q) || testTitle.includes(q);
  });

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white dark:bg-[linear-gradient(145deg,rgba(40,15,55,0.9),rgba(20,10,40,0.85))] backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-rose-500/30 dark:shadow-[0_8px_30px_rgba(244,63,94,0.15)] flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tl from-rose-500/5 to-purple-500/5 pointer-events-none"></div>
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight">All Test Results</h2>
        <input 
          type="text" 
          placeholder="Search by student, email, or test title..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500 w-full md:w-80"
        />
      </div>
      
      <div className="relative z-10 overflow-x-auto custom-scrollbar border border-slate-200 dark:border-white/10 rounded-xl w-full shadow-inner">
        <table className="min-w-[1000px] w-full divide-y divide-slate-200 dark:divide-white/5 text-left">
          <thead className="bg-slate-50 dark:bg-black/20">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Test Title</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Correct / Wrong</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/5 bg-white dark:bg-transparent">
            {filteredResults.map(r => (
              <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center">
                    {r.userId?.username || r.userId?.name || 'Unknown'}
                    {r.userId?.isPremium && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm" title="Premium User">PREMIUM</span>}
                  </div>
                  <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">{r.userId?.email || ''}</div>
                </td>
                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                  {r.testId?.title || 'Deleted Test'}
                </td>
                <td className="px-6 py-4">
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-500 text-2xl">{r.score}</span>
                </td>
                <td className="px-6 py-4 font-black text-emerald-500 text-lg">
                  {Math.round(r.accuracy)}%
                </td>
                <td className="px-6 py-4 font-bold">
                  <span className="text-emerald-500">{r.correctCount}</span> <span className="text-slate-300 dark:text-slate-600 mx-1">/</span> <span className="text-red-500">{r.wrongCount}</span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-500 dark:text-slate-400">
                  {new Date(r.attemptedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {filteredResults.length === 0 && (
               <tr>
                 <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-bold text-lg">No results found.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
