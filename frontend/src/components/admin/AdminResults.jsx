import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function AdminResults({ BASE_URL }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl border border-slate-200 dark:border-slate-700/50 flex flex-col">
      <h2 className="text-2xl sm:text-3xl font-black mb-6 text-slate-800 dark:text-white tracking-tight">All Test Results</h2>
      
      <div className="overflow-x-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl w-full">
        <table className="min-w-[1000px] w-full divide-y divide-slate-200 dark:divide-slate-700 text-left">
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Student</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Test Title</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Accuracy</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Correct / Wrong</th>
              <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800/50">
            {results.map(r => (
              <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-slate-900 dark:text-white">{r.userId?.name || 'Unknown'}</div>
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
            {results.length === 0 && (
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
