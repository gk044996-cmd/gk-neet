import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="max-w-lg w-full bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 text-center border border-slate-200 dark:border-slate-700"
      >
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
          Premium Activated!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg font-medium">
          Welcome to the Premium Club. Your exclusive access is now unlocked for 30 days.
        </p>

        <div className="bg-gradient-to-r from-amber-400/10 to-orange-500/10 p-6 rounded-2xl border border-amber-500/20 mb-8">
          <div className="text-4xl mb-3">👑</div>
          <h3 className="font-bold text-amber-600 dark:text-amber-400 text-lg mb-1">
            Premium Badge Unlocked
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You will now stand out on the leaderboard and have access to all premium tests.
          </p>
        </div>
        
        <button
          onClick={() => {
            // Hard reload to refresh auth context state easily
            window.location.href = '/dashboard';
          }}
          className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
        >
          Go to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
