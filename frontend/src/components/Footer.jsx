import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#052236] text-slate-600 dark:text-slate-400 py-16 border-t border-slate-200 dark:border-slate-800 transition-colors pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
              GK
            </div>
            <h3 className="text-2xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              NEET MOCK
            </h3>
          </div>
          <p className="mb-6 max-w-sm text-lg font-medium text-slate-500 dark:text-slate-400">
            Prepare for your NEET exam with real simulation, detailed analytics, and professional feedback designed by experts.
          </p>
        </div>
        
        <div>
          <h4 className="text-slate-900 dark:text-white font-black text-lg mb-6">Quick Links</h4>
          <ul className="space-y-4">
            <li><Link to="/dashboard" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Dashboard</Link></li>
            <li><Link to="/chapter-tests" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Chapter Tests</Link></li>
            <li><Link to="/leaderboard" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Leaderboard</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-slate-900 dark:text-white font-black text-lg mb-6">Support</h4>
          <ul className="space-y-4">
            <li><a href="#" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">FAQ</a></li>
            <li><a href="#" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact Us</a></li>
            <li><a href="#" className="font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms of Service</a></li>
          </ul>
        </div>
        
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-bold text-slate-500 dark:text-slate-500">&copy; {new Date().getFullYear()} GK NEET MOCK. All rights reserved.</p>
        <div className="flex items-center gap-2 text-sm font-bold bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          All systems operational
        </div>
      </div>
    </footer>
  );
}