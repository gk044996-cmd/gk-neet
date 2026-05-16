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
        } else {
          setMyRank('Not Attempted');
        }
      })
      .catch(err => console.error(err));
  }, [currentUser]);

  const totalTests = myResults.length;
  const highestScore = totalTests > 0 ? Math.max(...myResults.map(r => r.score || 0)) : 0;
  const averageScore = totalTests > 0 ? Math.round(myResults.reduce((acc, r) => acc + (r.score || 0), 0) / totalTests) : 0;
  
  const totalCorrect = myResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
  const totalWrong = myResults.reduce((acc, r) => acc + (r.wrongCount || 0), 0);
  const totalUnattempted = myResults.reduce((acc, r) => acc + (r.unattemptedCount || 0), 0);
  const totalAttempted = totalCorrect + totalWrong;
  const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Welcome back, {currentUser?.name || currentUser?.email}</h1>
        <p className="text-slate-500 dark:text-slate-400">Track your progress and attempt new mock tests.</p>
      </div>

      {totalTests === 0 ? (
        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-8 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800 mb-12 shadow-sm">
          <h2 className="text-2xl font-bold text-indigo-800 dark:text-indigo-300 mb-2">Welcome to GK NEET MOCK!</h2>
          <p className="text-indigo-600 dark:text-indigo-400">Attempt your first test to see analytics.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {/* Rank Card - Prominent */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/30 transform hover:-translate-y-1 transition-transform h-auto min-h-min overflow-visible relative z-10">
            <h3 className="text-indigo-100 mb-1 font-semibold uppercase tracking-wider text-sm">My Rank</h3>
            <p className="text-4xl font-black">{myRank === 'Not Attempted' ? <span className="text-2xl">Not Attempted</span> : (myRank ? `#${myRank}` : 'Loading...')}</p>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm text-center">
            <h3 className="text-purple-800 dark:text-purple-300 mb-1 text-xs font-bold uppercase tracking-wide">Total Tests</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalTests}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm text-center">
            <h3 className="text-purple-800 dark:text-purple-300 mb-1 text-xs font-bold uppercase tracking-wide">Highest Score</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{highestScore}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm text-center">
            <h3 className="text-purple-800 dark:text-purple-300 mb-1 text-xs font-bold uppercase tracking-wide">Average Score</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{averageScore}</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-xl border border-purple-200 dark:border-purple-800 shadow-sm text-center">
            <h3 className="text-purple-800 dark:text-purple-300 mb-1 text-xs font-bold uppercase tracking-wide">Overall Accuracy</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{accuracy}%</p>
          </div>

          {/* Additional Analytics */}
          <div className="bg-emerald-50 dark:bg-emerald-900/30 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-sm text-center">
            <h3 className="text-emerald-800 dark:text-emerald-300 mb-1 text-xs font-bold uppercase tracking-wide">Attempted Qs</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalAttempted}</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl border border-green-200 dark:border-green-800 shadow-sm text-center">
            <h3 className="text-green-800 dark:text-green-300 mb-1 text-xs font-bold uppercase tracking-wide">Correct Answers</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalCorrect}</p>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl border border-red-200 dark:border-red-800 shadow-sm text-center">
            <h3 className="text-red-800 dark:text-red-300 mb-1 text-xs font-bold uppercase tracking-wide">Wrong Answers</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalWrong}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-center lg:col-span-2">
            <h3 className="text-slate-600 dark:text-slate-300 mb-1 text-xs font-bold uppercase tracking-wide">Unattempted Qs</h3>
            <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnattempted}</p>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Available Mock Tests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map(test => {
          const attempt = myResults.find(r => r.testId && r.testId._id === test._id);
          
          return (
            <div key={test._id} className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-2xl flex flex-col border border-purple-200 dark:border-purple-800 shadow-md hover:shadow-lg transition-shadow h-auto min-h-min overflow-visible relative z-10 break-words">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-black text-black dark:text-white" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{test.title}</h3>
                {attempt && (
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md shrink-0 border border-emerald-200">Attempted</span>
                )}
              </div>
              <div className="flex justify-between text-sm text-slate-500 mb-4">
                <span>{test.totalQuestions || test.questions?.length || 0} Questions</span>
                <span>{test.duration} Mins</span>
              </div>
              
              {attempt ? (
                <div className="mt-auto">
                  <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl mb-4 border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Score:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{attempt.score} / {test.totalMarks}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-500 dark:text-slate-400">Accuracy:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{Math.round(attempt.accuracy)}%</span>
                    </div>
                    <div className="flex justify-between text-xs mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500">
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