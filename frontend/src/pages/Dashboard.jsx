import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { BASE_URL } from '../config';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [tests, setTests] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // Fetch tests
    fetch(`${BASE_URL}/tests`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(err => console.error(err));
      
    // Fetch results
    fetch(`${BASE_URL}/tests/my-results`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMyResults(data))
      .catch(err => console.error(err));

    // Fetch leaderboard for rank
    fetch(`${BASE_URL}/users/leaderboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const rankIndex = data.findIndex(u => u._id === currentUser.id);
        if (rankIndex !== -1) {
          setMyRank(rankIndex + 1);
        }
      })
      .catch(err => console.error(err));
  }, [currentUser]);

  const totalTests = myResults.length;
  const highestScore = totalTests > 0 ? Math.max(...myResults.map(r => r.score || 0)) : 0;
  const averageScore = totalTests > 0 ? Math.round(myResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests) : 0;
  
  const totalCorrect = myResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
  const totalQuestions = myResults.reduce((acc, r) => acc + ((r.correctCount || 0) + (r.wrongCount || 0) + (r.unattemptedCount || 0)), 0);
  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser?.email}</h1>
        <p className="text-slate-500">Track your progress and attempt new mock tests.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
        <div className="glass-panel p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 transition-transform">
          <h3 className="text-indigo-100 mb-1 font-semibold uppercase tracking-wider text-sm">My Rank</h3>
          <p className="text-4xl font-black">{myRank ? `#${myRank}` : 'N/A'}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Total Tests Taken</h3>
          <p className="text-3xl font-bold">{totalTests}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Highest Score</h3>
          <p className="text-3xl font-bold text-indigo-600">{highestScore}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Average Score</h3>
          <p className="text-3xl font-bold text-primary">{averageScore}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-slate-500 mb-1">Overall Accuracy</h3>
          <p className="text-3xl font-bold text-green-500">{accuracy}%</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Available Mock Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const attempt = myResults.find(r => r.testId && r.testId._id === test._id);
          
          return (
            <div key={test._id} className="glass-panel p-6 rounded-2xl flex flex-col border border-slate-200 dark:border-slate-800">
              <h3 className="text-xl font-bold mb-2">{test.title}</h3>
              <div className="flex justify-between text-sm text-slate-500 mb-4">
                <span>{test.totalQuestions || test.questions?.length || 0} Questions</span>
                <span>{test.duration} Mins</span>
              </div>
              
              {attempt ? (
                <div className="mt-auto">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Score:</span>
                      <span className="font-bold text-indigo-600">{attempt.score} / {test.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500">Accuracy:</span>
                      <span className="font-bold text-green-600">{Math.round(attempt.accuracy)}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-400">
                      <span>Completed:</span>
                      <span>{new Date(attempt.attemptedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link to={`/results/${attempt._id}`} className="block w-full text-center py-3 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-xl hover:bg-emerald-200 transition-colors font-semibold border border-emerald-200 dark:border-emerald-800">
                    ✅ View Result
                  </Link>
                </div>
              ) : (
                <Link to={`/test/${test._id}`} className="mt-auto block w-full text-center py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-semibold">
                  Start Test
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}