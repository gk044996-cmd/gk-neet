import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Bell, AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/notifications`, {
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
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifs(notifs.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'exam': return <CheckCircle className="w-6 h-6" />;
      case 'reminder': return <AlertCircle className="w-6 h-6" />;
      case 'premium': return <Sparkles className="w-6 h-6" />;
      default: return <Info className="w-6 h-6" />;
    }
  };

  const getColorClass = (type, isRead) => {
    if (isRead) return 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400';
    switch(type) {
      case 'exam': return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400';
      case 'reminder': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400';
      case 'premium': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400';
      default: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <SEO title="Notifications" description="View your alerts and reminders." />
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3 text-slate-900 dark:text-white">
            <Bell className="w-8 h-8 text-indigo-500" /> Notifications
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Stay updated with your latest alerts.</p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-100 dark:border-indigo-800/50">
            {unreadCount} Unread
          </span>
        )}
      </motion.div>
      
      {notifs.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-xl p-12 text-center rounded-[2rem]">
          <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">All caught up!</h3>
          <p className="text-slate-500 dark:text-slate-400">You have no new notifications right now.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {notifs.map((n, i) => (
              <motion.div 
                key={n._id} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !n.read && markAsRead(n._id)}
                className={`group bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-lg p-5 sm:p-6 rounded-2xl flex gap-4 items-start transition-all duration-300 relative overflow-hidden ${!n.read ? 'cursor-pointer' : ''}`}
              >
                {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>}
                
                <div className={`p-3.5 rounded-2xl shrink-0 shadow-inner transition-colors ${getColorClass(n.type, n.read)}`}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className={`font-bold truncate text-lg ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                    {n.title}
                  </h4>
                  <p className={`mt-1 line-clamp-2 ${!n.read ? 'text-slate-600 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-500'}`}>
                    {n.message}
                  </p>
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-3 block">
                    {new Date(n.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                {!n.read && (
                  <div className="shrink-0 w-3 h-3 bg-indigo-500 rounded-full mt-2 mr-2 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
