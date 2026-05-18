import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { User, Award, Flame, Target, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BASE_URL } from '../config';

export default function Profile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const res = await fetch(`${BASE_URL}/tests/my-results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!res.ok) {
          throw new Error('Failed to fetch profile data');
        }

        const data = await res.json();
        
        const completedResults = data.filter(r => r.completed);
        const totalTests = completedResults.length;
        const highestScore = totalTests > 0 ? Math.max(...completedResults.map(r => r.score || 0)) : 0;
        
        const totalCorrect = completedResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
        const totalWrong = completedResults.reduce((acc, r) => acc + (r.wrongCount || 0), 0);
        const totalAttempted = totalCorrect + totalWrong;
        const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
        
        // Reverse so chronological order for graph
        const chronological = [...completedResults].reverse().slice(-5);
        const graphData = chronological.map((r, i) => ({
          name: r.testId?.title ? r.testId.title.substring(0, 8) + '...' : `T${i+1}`,
          score: r.score
        }));

        let recommendations = [];
        if (totalTests === 0) {
          recommendations.push("Start taking mock tests to see AI recommendations here.");
        } else if (accuracy < 50) {
          recommendations.push("Focus on revising core concepts to improve accuracy.");
        } else {
          recommendations.push("Great accuracy! Keep maintaining this pace.");
        }

        setAnalytics({
          streak: totalTests > 0 ? 1 : 0, // Placeholder logic for streak
          accuracy,
          totalTests,
          highestScore,
          graphData,
          recommendations
        });
      } catch (err) {
        console.error("Failed to fetch profile data", err);
        setError(err.message || 'An unexpected error occurred while loading your profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchRealData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-600 font-semibold text-lg">Loading profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[60vh] text-center px-4">
        <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Oops! Something went wrong</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors">
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="My Profile" description="View your detailed NEET performance profile." />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col - Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-8 rounded-3xl text-center h-auto min-h-min overflow-visible relative z-10 break-words">
            <div className="w-24 h-24 mx-auto bg-primary/10 dark:bg-[#12344D] rounded-full flex items-center justify-center mb-4 shrink-0 shadow-inner">
              <User size={40} className="text-primary dark:text-[#5df8d8]" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-[#F8FAFC]">{currentUser?.name || currentUser?.displayName || 'NEET Aspirant'}</h2>
            <p className="text-slate-500 dark:text-[#D1E7F0] mt-1">{currentUser?.email}</p>
          </div>

          <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-6 rounded-3xl h-auto min-h-min overflow-visible relative z-10 break-words">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-[#F8FAFC]"><Target className="text-primary dark:text-[#5df8d8]" /> AI Recommendations</h3>
            <ul className="space-y-3 text-sm">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 bg-blue-50 dark:bg-[#12344D] text-blue-800 dark:text-[#D1E7F0] p-4 rounded-xl border border-blue-100 dark:border-[#1B4965] h-auto min-h-min shadow-sm" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  <span className="shrink-0">💡</span> <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col - Stats */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Flame className="mx-auto text-orange-500 dark:text-orange-400 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{analytics.streak}</div>
              <div className="text-xs text-slate-500 dark:text-[#A9C7D8] font-medium mt-1">Day Streak</div>
            </div>
            <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Award className="mx-auto text-yellow-500 dark:text-yellow-400 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{analytics.totalTests}</div>
              <div className="text-xs text-slate-500 dark:text-[#A9C7D8] font-medium mt-1">Tests Attempted</div>
            </div>
            <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Target className="mx-auto text-green-500 dark:text-green-400 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{analytics.accuracy}%</div>
              <div className="text-xs text-slate-500 dark:text-[#A9C7D8] font-medium mt-1">Avg Accuracy</div>
            </div>
            <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <User className="mx-auto text-purple-500 dark:text-purple-400 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-[#F8FAFC]">{analytics.highestScore}</div>
              <div className="text-xs text-slate-500 dark:text-[#A9C7D8] font-medium mt-1">Highest Score</div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-6 rounded-3xl h-auto min-h-min overflow-visible relative z-10">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-[#F8FAFC]">Progress History (Last 5 Tests)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.3} />
                  <XAxis dataKey="name" stroke="#A9C7D8" />
                  <YAxis domain={[0, 720]} stroke="#A9C7D8" />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', backgroundColor: '#12344D', color: '#F8FAFC', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }} itemStyle={{ color: '#F8FAFC' }} />
                  <Line type="monotone" dataKey="score" stroke="#5df8d8" strokeWidth={3} dot={{ r: 6, fill: '#5df8d8', strokeWidth: 2, stroke: '#12344D' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
