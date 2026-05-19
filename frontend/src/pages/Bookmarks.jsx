import React from 'react';
import SEO from '../components/SEO';
import { Bookmark, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Bookmarks() {
  return (
    <div className="min-h-[80vh] flex flex-col max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      <SEO title="Bookmarked Questions" description="Review your saved difficult questions." />
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-3xl rounded-full pointer-events-none"></div>
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-4">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">Revision</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center shadow-inner">
            <Bookmark size={28} />
          </div>
          Bookmarks
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl font-medium">Revise your saved difficult questions and track your learning progress here.</p>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="flex-1 bg-white dark:bg-slate-800/80 backdrop-blur-xl p-12 md:p-20 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-700/50 text-center flex flex-col items-center justify-center relative overflow-hidden group">
        
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent dark:from-indigo-900/10 pointer-events-none"></div>

        <div className="w-32 h-32 bg-indigo-50 dark:bg-slate-700/50 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner relative z-10 group-hover:scale-110 transition-transform duration-500">
          <Bookmark size={56} className="text-indigo-300 dark:text-indigo-500" />
        </div>
        
        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 relative z-10">No bookmarks yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto mb-8 relative z-10">
          You haven't saved any questions for review yet. Click the <strong className="text-slate-700 dark:text-slate-200">"Mark for Review"</strong> button during your mock tests to save them here.
        </p>
        
        <button className="px-8 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold rounded-2xl transition-all shadow-sm relative z-10">
          Explore Mock Tests
        </button>

      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 p-6 rounded-3xl flex items-center justify-between gap-4 flex-col sm:flex-row shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-200 dark:bg-amber-800/50 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="font-bold text-amber-900 dark:text-amber-400">Premium Feature</h4>
            <p className="text-amber-800/80 dark:text-amber-500/80 text-sm">Unlock AI-generated similar questions for your bookmarks.</p>
          </div>
        </div>
        <button className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-amber-500/30 whitespace-nowrap">
          Upgrade Now
        </button>
      </motion.div>
    </div>
  );
}
