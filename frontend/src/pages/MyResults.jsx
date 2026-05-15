import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentTextIcon, ChartBarIcon, ArrowDownTrayIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BASE_URL } from '../config';
import Navbar from '../components/Navbar';

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
      const res = await fetch(`${BASE_URL}/tests/my-results`, {
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
        return [...results]; // Already sorted by latest from backend
    }
  };

  const sortedResults = getSortedResults();

  if (loading) return <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              My Results History
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">View and analyze all your past mock test performances.</p>
          </div>
          <div className="mt-4 md:mt-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="latest">Latest Attempts</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>

        {error && <div className="p-4 bg-red-100 text-red-700 rounded-xl mb-6">{error}</div>}

        {results.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <DocumentTextIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No results yet</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">You haven't attempted any mock tests yet.</p>
            <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
              Take a Mock Test
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedResults.map((result) => (
              <div key={result._id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-2">
                      {result.testId ? result.testId.title : 'Deleted Test'}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6">
                    <ClockIcon className="w-4 h-4" />
                    {new Date(result.attemptedAt).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Score</p>
                      <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-300">
                        {result.score} <span className="text-sm font-medium text-indigo-500">/ {result.testId ? result.testId.totalMarks : '?'}</span>
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Accuracy</p>
                      <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                        {Math.round(result.accuracy)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button 
                      onClick={() => navigate(`/results/${result._id}`)}
                      className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                    >
                      View Details
                    </button>
                    <button 
                      onClick={() => navigate(`/results/${result._id}?download=true`)}
                      className="p-2.5 text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                      title="Download PDF"
                    >
                      <ArrowDownTrayIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyResults;
