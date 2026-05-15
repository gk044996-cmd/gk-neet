import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 dark:from-primary/5 dark:to-accent/5 -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Prepare Like <br/>
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Real NEET</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-10 max-w-3xl mx-auto"
          >
            Experience the exact NTA exam pattern, get detailed analytics, and improve your score with our premium mock test platform.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link to="/register" className="px-8 py-4 rounded-full bg-primary text-white font-semibold text-lg hover:bg-primary/90 shadow-lg shadow-primary/30 transition-all hover:-translate-y-1 w-full sm:w-auto">
              Start Mock Test
            </Link>
            <Link to="/login" className="px-8 py-4 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold text-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm transition-all w-full sm:w-auto">
              View Analytics
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Everything you need to crack NEET with confidence.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'NTA Pattern', desc: 'Exact exam interface with 180 questions, negative marking, and timer.' },
              { title: 'In-Depth Analytics', desc: 'Subject-wise performance, time tracking, and accuracy graphs.' },
              { title: 'Detailed Solutions', desc: 'Comprehensive explanations for every question after submission.' }
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-300">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 text-xl font-bold">{i+1}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}