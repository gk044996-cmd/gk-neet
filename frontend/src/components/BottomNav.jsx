import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, Bell, UserCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  const links = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Rank', path: '/leaderboard', icon: Trophy },
    { name: 'Alerts', path: '/notifications', icon: Bell },
    { name: 'Profile', path: '/profile', icon: UserCircle2 },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full rounded-t-3xl bg-white/95 dark:bg-[#151821]/95 backdrop-blur-2xl border-t border-slate-200/50 dark:border-slate-800/80 flex justify-around items-center h-[80px] z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.2)] transition-colors duration-300 px-2">
      
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.path;
        
        return (
          <Link 
            key={link.name} 
            to={link.path} 
            className="relative flex flex-col items-center justify-center w-full h-full group outline-none"
          >
            {isActive && (
              <motion.div 
                layoutId="bottomNavIndicator"
                className="absolute -top-[1px] w-12 h-[3px] bg-indigo-600 dark:bg-indigo-500 rounded-b-full shadow-[0_2px_8px_rgba(99,102,241,0.5)] z-10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <div className={`relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ease-out transform group-active:scale-90 ${isActive ? 'bg-indigo-50 dark:bg-indigo-500/10 -translate-y-1' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
              <Icon 
                strokeWidth={isActive ? 2.5 : 2} 
                size={24} 
                className={`transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 scale-110 drop-shadow-sm' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 group-hover:scale-105'}`} 
                fill={isActive ? "currentColor" : "none"} 
                fillOpacity={isActive ? 0.15 : 0}
              />
            </div>
            
            <span className={`text-[10px] mt-0.5 font-bold tracking-wide transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-indigo-400 opacity-100' : 'text-slate-400 dark:text-slate-500 opacity-80 group-hover:opacity-100 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
