import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  return (
    <nav className="fixed w-full z-50 glass-panel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GK NEET MOCK</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="hover:text-primary transition-colors text-indigo-600 dark:text-indigo-400 font-semibold">Admin Panel</Link>
                )}
                <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/results" className="hover:text-primary transition-colors">My Results</Link>
                <Link to="/leaderboard" className="hover:text-primary transition-colors">Leaderboard</Link>
                <button onClick={logout} className="px-4 py-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary transition-colors">Login</Link>
                <Link to="/register" className="px-4 py-2 rounded-full bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}