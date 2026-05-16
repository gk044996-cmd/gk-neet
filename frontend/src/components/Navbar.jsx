import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 glass-panel border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GK NEET MOCK</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none p-2 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7 stroke-[2.5]" />
              ) : (
                <Bars3Icon className="h-7 w-7 stroke-[2.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-2 pb-4 space-y-2 shadow-2xl absolute w-full top-16 left-0 z-50">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Home</Link>
          {currentUser ? (
            <>
              {currentUser.role === 'admin' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold bg-black text-white dark:bg-white dark:text-black shadow-md text-center mt-2 mb-2">Admin Panel</Link>
              )}
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Dashboard</Link>
              <Link to="/results" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">My Results</Link>
              <Link to="/leaderboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-4 py-3 rounded-xl text-base font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Leaderboard</Link>
              <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full text-center mt-4 px-4 py-3 rounded-xl text-base font-bold border-2 border-black text-black dark:border-white dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block mt-4 px-4 py-3 rounded-xl text-base font-bold bg-black text-white dark:bg-white dark:text-black text-center shadow-md">Login</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block mt-2 px-4 py-3 rounded-xl text-base font-bold border-2 border-black text-black dark:border-white dark:text-white text-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}