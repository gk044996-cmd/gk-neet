import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { User, Award, Flame, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Profile() {
  const { currentUser } = useAuth();
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    // Mock analytics fetch
    setAnalytics({
      streak: 5,
      accuracy: 88,
      totalTests: 24,
      graphData: [
        { name: 'T1', score: 450 }, { name: 'T2', score: 520 }, 
        { name: 'T3', score: 490 }, { name: 'T4', score: 580 }, 
        { name: 'T5', score: 610 }
      ],
      recommendations: ["Focus on Physics Mechanics.", "Great accuracy in Zoology!"]
    });
  }, []);

  if(!analytics) return <div className="text-center py-20">Loading profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="My Profile" description="View your detailed NEET performance profile." />
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Col - Info */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass-panel p-8 rounded-3xl text-center">
            <div className="w-24 h-24 mx-auto bg-primary/20 rounded-full flex items-center justify-center mb-4">
              <User size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold">{currentUser?.displayName || 'NEET Aspirant'}</h2>
            <p className="text-slate-500">{currentUser?.email}</p>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Target className="text-primary" /> AI Recommendations</h3>
            <ul className="space-y-3 text-sm">
              {analytics.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
                  <span>💡</span> {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Col - Stats */}
        <div className="w-full md:w-2/3 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Flame className="mx-auto text-orange-500 mb-2" />
              <div className="text-2xl font-black">{analytics.streak}</div>
              <div className="text-xs text-slate-500">Day Streak</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Award className="mx-auto text-yellow-500 mb-2" />
              <div className="text-2xl font-black">{analytics.totalTests}</div>
              <div className="text-xs text-slate-500">Tests Attempted</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <Target className="mx-auto text-green-500 mb-2" />
              <div className="text-2xl font-black">{analytics.accuracy}%</div>
              <div className="text-xs text-slate-500">Avg Accuracy</div>
            </div>
            <div className="glass-panel p-5 rounded-2xl text-center">
              <User className="mx-auto text-purple-500 mb-2" />
              <div className="text-2xl font-black">610</div>
              <div className="text-xs text-slate-500">Highest Score</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl">
            <h3 className="font-bold mb-6">Progress History (Last 5 Tests)</h3>
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
