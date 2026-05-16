import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutDashboard, BookOpen, User, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { pathname } = useLocation();
  const { currentUser } = useAuth();
  if (!currentUser) return null;

  const links = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Alerts', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 z-50 pb-safe">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.path;
        return (
          <Link key={link.name} to={link.path} className={`flex flex-col items-center justify-center w-full h-full ${isActive ? 'text-primary' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <Icon size={20} className={`${isActive ? 'fill-primary/20' : ''}`} />
            <span className="text-[10px] mt-1 font-medium">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
