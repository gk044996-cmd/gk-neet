import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { BASE_URL } from '../config';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${BASE_URL}/notifications`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifs(data);
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifs(notifs.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-900 dark:text-white">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEO title="Notifications" description="View your alerts and reminders." />
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3 text-slate-900 dark:text-[#F8FAFC]"><Bell /> Notifications</h1>
      
      {notifs.length === 0 ? (
        <div className="bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-10 text-center rounded-2xl">
          <p className="text-slate-500 dark:text-[#D1E7F0]">You have no new notifications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifs.map(n => (
            <div 
              key={n._id} 
              onClick={() => markAsRead(n._id)}
              className={`bg-white dark:bg-[#163E5A] border border-slate-200 dark:border-[#1B4965] shadow-lg dark:shadow-black/20 p-5 rounded-2xl flex gap-4 items-start cursor-pointer hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 ${!n.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-[#12344D]' : ''}`}
            >
              <div className={`p-3 rounded-full shrink-0 shadow-inner ${n.type === 'exam' ? 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-[#5df8d8]' : n.type === 'reminder' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                {n.type === 'exam' ? <CheckCircle size={24} /> : n.type === 'reminder' ? <AlertCircle size={24} /> : <Info size={24} />}
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-slate-900 dark:text-[#F8FAFC] ${!n.read ? 'text-blue-600 dark:text-[#5df8d8]' : ''}`}>{n.title}</h4>
                <p className="text-sm text-slate-500 dark:text-[#D1E7F0] mt-1 break-words">{n.message}</p>
                <span className="text-xs text-slate-400 dark:text-[#A9C7D8] mt-2 block">{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              {!n.read && <div className="w-2 h-2 bg-blue-500 dark:bg-[#5df8d8] rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(93,248,216,0.5)]"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
