import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, ChartBarIcon, ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { API_URL } from '../config';
import { motion } from 'framer-motion';

function MyResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('latest');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/tests/my-results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch results');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSortedResults = () => {
    switch (sortBy) {
      case 'highest':
        return [...results].sort((a, b) => b.score - a.score);
      case 'lowest':
        return [...results].sort((a, b) => a.score - b.score);
      default:
        return [...results];
    }
  };

  const sortedResults = getSortedResults();

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] transition-colors relative selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none z-0"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-3">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest">Analytics</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
              Performance History
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Review and analyze all your past mock test attempts.</p>
          </div>
          <div className="mt-2 md:mt-0 relative group">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-5 pr-12 py-3.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-white dark:bg-slate-800/80 backdrop-blur-md text-slate-700 dark:text-slate-200 font-bold outline-none hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-sm cursor-pointer"
            >
              <option value="latest">Latest Attempts</option>
              <option value="highest">Highest Score First</option>
              <option value="lowest">Lowest Score First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </motion.div>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6 font-bold">{error}</div>}

        {results.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-24 bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700/50">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <DocumentTextIcon className="w-12 h-12 text-indigo-400 dark:text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Results Found</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto font-medium">You haven't completed any mock tests yet. Take a test to start tracking your performance.</p>
            <button onClick={() => navigate('/dashboard')} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/30 transition-transform hover:-translate-y-1">
              Start Your First Test
            </button>
          </motion.div>
        ) : (
          <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedResults.map((result) => (
              <motion.div variants={itemVars} key={result._id} className="group bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-[2rem] shadow-sm hover:shadow-2xl border border-slate-200 dark:border-slate-700/50 overflow-hidden transition-all duration-300 hover:-translate-y-1 relative flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-colors"></div>
                
                <div className="p-6 sm:p-8 flex flex-col flex-1 relative z-10">
                  <div className="flex justify-between items-start mb-5">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight">
                      {result.testId ? result.testId.title : 'Deleted Test'}
                    </h3>
                  </div>
                  
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 self-start">
                    <ClockIcon className="w-4 h-4 text-indigo-500" />
                    {new Date(result.attemptedAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-800/30">
                      <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1 opacity-80">Score</p>
                      <p className="text-3xl font-black text-indigo-900 dark:text-indigo-200">
                        {result.score} <span className="text-sm font-bold text-indigo-400">/ {result.testId ? result.testId.totalMarks : '?'}</span>
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                      <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 opacity-80">Accuracy</p>
                      <p className="text-3xl font-black text-emerald-900 dark:text-emerald-200">
                        {Math.round(result.accuracy)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => navigate(`/results/${result._id}`)}
                      className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:shadow-lg"
                    >
                      View Report
                    </button>
                    <button 
                      onClick={() => navigate(`/results/${result._id}?download=true`)}
                      className="p-3.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition-colors border border-indigo-100 dark:border-indigo-800/50"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default MyResults;
