import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { User, Award, Flame, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/tests/my-results`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        const completedResults = data.filter(r => r.completed);
        const totalTests = completedResults.length;
        const highestScore = totalTests > 0 ? Math.max(...completedResults.map(r => r.score || 0)) : 0;
        
        const totalCorrect = completedResults.reduce((acc, r) => acc + (r.correctCount || 0), 0);
        const totalAttempted = completedResults.reduce((acc, r) => acc + ((r.correctCount || 0) + (r.wrongCount || 0)), 0);
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
      }
    };
    fetchRealData();
  }, []);

  if(!analytics) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="My Profile" description="View your detailed NEET performance profile." />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col - Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl text-center h-auto min-h-min overflow-visible relative z-10 break-words">
            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4 shrink-0">
              <User size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{currentUser?.name || currentUser?.displayName || 'NEET Aspirant'}</h2>
            <p className="text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl h-auto min-h-min overflow-visible relative z-10 break-words">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><Target className="text-primary" /> AI Recommendations</h3>
            <ul className="space-y-3 text-sm">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg border border-blue-100 dark:border-blue-800 h-auto min-h-min" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                  <span className="shrink-0">💡</span> <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col - Stats */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Flame className="mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.streak}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Day Streak</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Award className="mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.totalTests}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Tests Attempted</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <Target className="mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.accuracy}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Avg Accuracy</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center h-auto min-h-min overflow-visible relative z-10">
              <User className="mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white">{analytics.highestScore}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Highest Score</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl h-auto min-h-min overflow-visible relative z-10">
            <h3 className="font-bold mb-6 text-slate-900 dark:text-white">Progress History (Last 5 Tests)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.graphData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[0, 720]} stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 6, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
