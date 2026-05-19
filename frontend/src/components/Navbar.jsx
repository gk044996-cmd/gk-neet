import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'My Results', path: '/results' },
    { name: 'Leaderboard', path: '/leaderboard' },
    { name: 'Alerts', path: '/notifications' }
  ];

  return (
    <>
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-[linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,58,138,0.9),rgba(6,182,212,0.9))] backdrop-blur-xl border-b border-slate-200/50 dark:border-cyan-500/30 transition-all shadow-sm dark:shadow-[0_4px_30px_rgba(6,182,212,0.15)] relative">
      {/* Separation glow effect for dark theme */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 dark:opacity-50 blur-[0.5px]"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px] items-center">
          <Link to="/" className="text-xl md:text-2xl font-black flex items-center gap-3 group relative">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-md opacity-30 group-hover:opacity-60 transition-opacity rounded-xl"></div>
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] border border-white/20 group-hover:scale-110 transition-transform">
                <span className="text-sm tracking-wider">GK</span>
              </div>
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 dark:from-cyan-100 dark:to-white bg-clip-text text-transparent group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] dark:group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all tracking-tight">NEET MOCK</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {currentUser ? (
              <>
                {currentUser.role === 'admin' && (
                  <Link to="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all mr-2">Admin Panel</Link>
                )}
                
                {navLinks.map((link) => (
                  <Link key={link.name} to={link.path} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all relative ${location.pathname === link.path ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    {link.name}
                  </Link>
                ))}

                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                
                <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-sm">
                    {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  {currentUser.isPremium && <span className="text-sm" title="Premium">👑</span>}
                </Link>
                <button onClick={logout} className="ml-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 transition-all">Logout</button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Login</Link>
                <Link to="/register" className="px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5">Sign Up</Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {currentUser?.isPremium && <span className="text-xl" title="Premium">👑</span>}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="relative group p-2.5 rounded-xl transition-all duration-300 bg-white/50 dark:bg-blue-900/40 backdrop-blur-md shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-slate-200 dark:border-cyan-400/30 hover:dark:border-cyan-400/60 active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6 stroke-[2.5] text-slate-800 dark:text-cyan-100 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
              ) : (
                <Bars3Icon className="h-6 w-6 stroke-[2.5] text-slate-800 dark:text-cyan-100 relative z-10 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] transition-all" />
              )}
            </button>
          </div>
        </div>
      </div>

    </nav>
      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90]"
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer (Right Sidebar) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ x: '100%', opacity: 0.8 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden fixed top-0 right-0 w-[85vw] max-w-sm h-[100dvh] bg-white/95 dark:bg-[linear-gradient(180deg,rgba(26,11,46,0.95),rgba(45,11,78,0.95))] backdrop-blur-2xl border-l border-slate-200 dark:border-fuchsia-500/30 shadow-2xl dark:shadow-[-10px_0_40px_rgba(217,70,239,0.15)] z-[100] overflow-y-auto pb-8 flex flex-col"
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-fuchsia-100 hover:dark:bg-white/20 transition-colors shadow-sm">
                <XMarkIcon className="h-7 w-7 stroke-[2.5]" />
              </button>
            </div>
            
            <div className="px-6 pb-6 space-y-6 flex-1">
              {currentUser ? (
                <>
                  {/* Premium Glass Profile Card */}
                  <div className="relative p-5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-fuchsia-400/30 shadow-lg dark:shadow-[0_0_20px_rgba(217,70,239,0.15)] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="relative shrink-0">
                        <div className="absolute inset-0 bg-fuchsia-500 blur-md opacity-40 rounded-full animate-pulse"></div>
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-inner border-2 border-white/20 relative z-10">
                          {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2 tracking-tight truncate">
                          {currentUser.name} {currentUser.isPremium && <span className="drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">👑</span>}
                        </p>
                        <p className="text-sm font-medium text-slate-500 dark:text-fuchsia-200/70 truncate">{currentUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mt-8">
                    {currentUser.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_15px_rgba(192,38,211,0.4)] text-center hover:scale-[1.02] transition-transform">Admin Panel</Link>
                    )}
                    
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      return (
                        <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`relative block px-5 py-4 rounded-xl text-base font-bold transition-all duration-300 overflow-hidden group ${isActive ? 'bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)] dark:border dark:border-fuchsia-500/30 scale-[1.02]' : 'text-slate-700 dark:text-fuchsia-100/70 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                          {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] rounded-l-xl"></div>}
                          <span className={`relative z-10 ${isActive ? 'drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]' : ''}`}>{link.name}</span>
                        </Link>
                      );
                    })}
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`relative block px-5 py-4 rounded-xl text-base font-bold transition-all duration-300 overflow-hidden group ${location.pathname === '/profile' ? 'bg-fuchsia-50 dark:bg-fuchsia-500/20 text-fuchsia-600 dark:text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)] dark:border dark:border-fuchsia-500/30 scale-[1.02]' : 'text-slate-700 dark:text-fuchsia-100/70 hover:bg-slate-50 dark:hover:bg-white/5'}`}>
                      {location.pathname === '/profile' && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.8)] rounded-l-xl"></div>}
                      <span className={`relative z-10 ${location.pathname === '/profile' ? 'drop-shadow-[0_0_5px_rgba(217,70,239,0.5)]' : ''}`}>Profile</span>
                    </Link>
                  </div>
                  
                  <div className="pt-6 mt-auto border-t border-slate-100 dark:border-white/10">
                    <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="relative w-full flex items-center justify-center gap-2 px-5 py-4 rounded-xl text-base font-black text-white bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 transition-all shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] active:scale-95 group overflow-hidden">
                      <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                      <span className="relative z-10 drop-shadow-md">Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 pt-4 mt-auto">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full px-5 py-4 rounded-xl text-base font-black bg-white/80 dark:bg-white/10 text-slate-900 dark:text-white text-center hover:bg-white dark:hover:bg-white/20 backdrop-blur-md border border-slate-200 dark:border-white/10 transition-colors">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full px-5 py-4 rounded-xl text-base font-black text-white bg-gradient-to-r from-fuchsia-600 to-purple-600 text-center hover:from-fuchsia-500 hover:to-purple-500 transition-all shadow-[0_0_20px_rgba(192,38,211,0.4)] hover:scale-[1.02]">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}