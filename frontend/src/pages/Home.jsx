import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden animated-bg">
        <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-900/90 backdrop-blur-sm -z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4 px-4 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 backdrop-blur-md text-blue-700 dark:text-blue-300 font-semibold text-sm"
          >
            🚀 The Ultimate NEET Preparation Platform
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Prepare Like <br/>
            <span className="gradient-text">Real NEET</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-10 max-w-3xl mx-auto font-medium"
          >
            Experience the exact NTA exam pattern, get detailed analytics, and improve your score with our premium mock test platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link to="/register" className="px-8 py-4 rounded-full premium-gradient text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/40 hover:-translate-y-1 transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2">
              Start Mock Test
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-900 dark:text-white font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 shadow-sm hover:shadow-md transition-all w-full sm:w-auto text-center">
              View Analytics
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 relative">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))] -z-10" style={{ backgroundSize: '30px 30px', backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900 dark:text-white">Why Choose Us?</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-medium">Everything you need to crack NEET with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'NTA Pattern', desc: 'Exact exam interface with 180 questions, negative marking, and timer.', icon: '🎯' },
              { title: 'In-Depth Analytics', desc: 'Subject-wise performance, time tracking, and accuracy graphs.', icon: '📈' },
              { title: 'Detailed Solutions', desc: 'Comprehensive explanations for every question after submission.', icon: '💡' }
            ].map((feature, i) => (
              <div key={i} className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-xl p-8 rounded-3xl group transition-all duration-300 hover:shadow-2xl">
                <div className="w-14 h-14 bg-blue-200 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-2xl flex items-center justify-center mb-6 text-3xl font-bold group-hover:scale-110 transition-transform shadow-sm">{feature.icon}</div>
                <h3 className="text-2xl font-black mb-3 text-black dark:text-white">{feature.title}</h3>
                <p className="text-slate-900 dark:text-slate-200 font-bold leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}