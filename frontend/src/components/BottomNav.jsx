import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Bell, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const links = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Rank', path: '/leaderboard', icon: Award },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center h-16 z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-all">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.path;
        
        return (
          <Link 
            key={link.name} 
            to={link.path} 
            className="relative flex flex-col items-center justify-center w-full h-full group"
          >
            {isActive && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -top-[1px] w-12 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-b-full shadow-[0_4px_10px_rgba(79,70,229,0.5)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 group-hover:text-slate-900 dark:group-hover:text-slate-200'}`}>
              <Icon size={20} className={`transition-all duration-300 ${isActive ? 'scale-110' : ''}`} />
            </div>
            
            <span className={`text-[10px] mt-0.5 font-bold transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-105' : 'text-slate-500 dark:text-slate-400'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
