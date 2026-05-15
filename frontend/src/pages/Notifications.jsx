import React from 'react';
import SEO from '../components/SEO';
import { Bell, AlertCircle, CheckCircle } from 'lucide-react';

export default function Notifications() {
  const notifs = [
    { id: 1, title: 'Exam Reminder', msg: 'NEET Full Mock 4 is scheduled for tomorrow.', type: 'reminder', time: '2h ago' },
    { id: 2, title: 'Result Published', msg: 'Your results for Biology Chapter Test are ready.', type: 'alert', time: '1d ago' },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="Notifications" description="View your alerts and reminders." />
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><Bell /> Notifications</h1>
      
      <div className="space-y-4">
        {notifs.map(n => (
          <div key={n.id} className="glass-panel p-5 rounded-2xl flex gap-4 items-start">
            <div className={`p-3 rounded-full ${n.type === 'reminder' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
              {n.type === 'reminder' ? <AlertCircle size={24} /> : <CheckCircle size={24} />}
            </div>
            <div className="flex-1">
              <h4 className="font-bold">{n.title}</h4>
              <p className="text-sm text-slate-500 mt-1">{n.msg}</p>
              <span className="text-xs text-slate-400 mt-2 block">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
