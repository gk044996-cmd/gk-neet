import React, { useState, useEffect } from 'react';

export default function AdminResults({ BASE_URL }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BASE_URL}/admin/results`, {
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

  if (loading) return <div className="py-12 text-center text-slate-500">Loading results...</div>;

  return (
    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white">All Test Results</h2>
      
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-left">
        <thead>
          <tr>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Student</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Test Title</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Score</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Accuracy</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Correct / Wrong</th>
            <th className="px-4 py-3 text-sm font-semibold text-slate-500">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {results.map(r => (
            <tr key={r._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <td className="px-4 py-4">
                <div className="font-semibold text-slate-800 dark:text-white">{r.userId?.name || 'Unknown'}</div>
                <div className="text-sm text-slate-500">{r.userId?.email || ''}</div>
              </td>
              <td className="px-4 py-4 font-medium text-slate-700 dark:text-slate-300">
                {r.testId?.title || 'Deleted Test'}
              </td>
              <td className="px-4 py-4">
                <span className="font-bold text-indigo-600 text-lg">{r.score}</span>
              </td>
              <td className="px-4 py-4 font-bold text-emerald-600">
                {Math.round(r.accuracy)}%
              </td>
              <td className="px-4 py-4">
                <span className="text-emerald-600 font-semibold">{r.correctCount}</span> / <span className="text-red-500 font-semibold">{r.wrongCount}</span>
              </td>
              <td className="px-4 py-4 text-sm text-slate-500">
                {new Date(r.attemptedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
