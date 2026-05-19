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
    <div className="md:hidden fixed bottom-0 w-full rounded-t-3xl bg-white/90 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,58,138,0.9),rgba(6,182,212,0.9))] backdrop-blur-xl border-t border-slate-200/50 dark:border-cyan-500/30 flex justify-around items-center h-[76px] z-50 pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_30px_rgba(6,182,212,0.2)] transition-all">
      {/* Top glowing line for dark theme */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 dark:opacity-50 blur-[0.5px] rounded-t-3xl"></div>

      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.path;
        
        return (
          <Link 
            key={link.name} 
            to={link.path} 
            className="relative flex flex-col items-center justify-center w-full h-full group pt-1"
          >
            {isActive && (
              <>
                <motion.div 
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 w-12 h-[3px] bg-indigo-600 dark:bg-cyan-400 rounded-b-full shadow-[0_4px_12px_rgba(6,182,212,0.8)] z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <div className="absolute top-0 w-16 h-8 bg-cyan-400/20 blur-xl rounded-full pointer-events-none"></div>
              </>
            )}
            
            <div className={`relative p-2 rounded-2xl transition-all duration-300 transform group-active:scale-90 ${isActive ? 'bg-indigo-50 dark:bg-cyan-500/20 text-indigo-600 dark:text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] -translate-y-1' : 'text-slate-500 dark:text-cyan-100/50 group-hover:text-slate-900 dark:group-hover:text-cyan-100 group-hover:-translate-y-1'}`}>
              <Icon strokeWidth={isActive ? 2.5 : 2} size={22} className={`relative z-10 transition-all duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]'}`} />
            </div>
            
            <span className={`text-[11px] mt-1 font-bold tracking-wide transition-all duration-300 ${isActive ? 'text-indigo-600 dark:text-cyan-300 scale-105 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]' : 'text-slate-500 dark:text-cyan-100/50 group-hover:text-slate-900 dark:group-hover:text-cyan-100'}`}>
              {link.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
