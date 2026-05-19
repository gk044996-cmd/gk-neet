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
    { name: 'Tests', path: '/tests' },
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
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="md:hidden fixed top-0 right-0 w-[85vw] max-w-sm h-[100dvh] bg-white dark:bg-[#1A1D24] border-l border-slate-200 dark:border-slate-800/80 shadow-2xl z-[100] overflow-y-auto pb-8 flex flex-col"
          >
            <div className="flex justify-end p-4">
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm">
                <XMarkIcon className="h-6 w-6 stroke-2" />
              </button>
            </div>
            
            <div className="px-6 pb-6 space-y-6 flex-1">
              {currentUser ? (
                <>
                  {/* Elegant Profile Card */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#22252D] border border-slate-100 dark:border-slate-700/30 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="shrink-0">
                      <div className="w-14 h-14 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-sm">
                        {currentUser.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2 truncate">
                        {currentUser.name} {currentUser.isPremium && <span title="Premium Member">👑</span>}
                      </p>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-8">
                    {currentUser.role === 'admin' && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-5 py-3.5 rounded-xl text-base font-bold bg-indigo-600 dark:bg-indigo-500 text-white text-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm mb-4">Admin Panel</Link>
                    )}
                    
                    {navLinks.map((link) => {
                      const isActive = location.pathname === link.path;
                      return (
                        <Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`relative block px-5 py-3.5 rounded-xl text-base transition-colors ${isActive ? 'bg-slate-100 dark:bg-[#22252D] text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#22252D]/50 font-medium'}`}>
                          {isActive && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-md"></div>}
                          <span className="relative z-10">{link.name}</span>
                        </Link>
                      );
                    })}
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`relative block px-5 py-3.5 rounded-xl text-base transition-colors ${location.pathname === '/profile' ? 'bg-slate-100 dark:bg-[#22252D] text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#22252D]/50 font-medium'}`}>
                      {location.pathname === '/profile' && <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 dark:bg-indigo-500 rounded-r-md"></div>}
                      <span className="relative z-10">Profile</span>
                    </Link>
                  </div>
                  
                  <div className="pt-6 mt-auto border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => { setIsMobileMenuOpen(false); logout(); }} className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-base font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 pt-4 mt-auto border-t border-slate-100 dark:border-slate-800">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full px-5 py-3.5 rounded-xl text-base font-bold bg-slate-50 dark:bg-[#22252D] text-slate-700 dark:text-slate-300 text-center hover:bg-slate-100 dark:hover:bg-[#22252D]/80 transition-colors">Login</Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full px-5 py-3.5 rounded-xl text-base font-bold bg-indigo-600 dark:bg-indigo-500 text-white text-center hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors shadow-sm">Sign Up</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}