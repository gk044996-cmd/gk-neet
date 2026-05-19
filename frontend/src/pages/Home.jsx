import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-[#0f172a] min-h-screen selection:bg-indigo-500/30">
      {/* Animated Background Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-b from-indigo-500/20 to-purple-500/20 blur-[120px]" />
        <div className="absolute -bottom-[40%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-t from-cyan-500/20 to-blue-500/20 blur-[120px]" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 min-h-[90vh] flex items-center justify-center pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-md shadow-sm mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">NEET 2026 Preparation Starts Here</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight text-slate-900 dark:text-white mb-6 leading-tight">
            Crack NEET with <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 drop-shadow-sm">Absolute Precision</span>
          </motion.h1>

          <motion.p variants={itemVariants} className="mt-6 text-lg md:text-2xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Experience the exact NTA exam pattern. Analyze your weaknesses. Compete with top aspirants on India's most advanced mock test platform.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="group relative w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 ease-in-out transform rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.7)] hover:-translate-y-1">
              Start Free Mock Test
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-700 dark:text-slate-200 transition-all duration-300 ease-in-out transform rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm backdrop-blur-sm">
              Login to Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 py-12 border-y border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-900/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Students', value: '10,000+' },
              { label: 'Mock Tests', value: '500+' },
              { label: 'Questions', value: '50,000+' },
              { label: 'Selections', value: '1,200+' }
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="flex flex-col items-center justify-center"
              >
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{stat.value}</h3>
                <p className="text-sm md:text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base text-indigo-600 dark:text-indigo-400 font-bold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl md:text-5xl leading-tight font-black text-slate-900 dark:text-white tracking-tight">Everything you need to succeed</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                title: 'NTA Exam Interface',
                description: 'Practice on an interface that perfectly replicates the real NEET exam, ensuring zero surprises on D-Day.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                ),
                color: 'from-blue-500 to-cyan-500'
              },
              {
                title: 'Detailed Analytics',
                description: 'Get deep insights into your subject-wise accuracy, time management, and personalized improvement areas.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                ),
                color: 'from-purple-500 to-pink-500'
              },
              {
                title: 'Detailed Solutions',
                description: 'Review your mistakes with comprehensive, step-by-step explanations curated by top medical faculty.',
                icon: (
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                ),
                color: 'from-emerald-500 to-teal-500'
              }
            ].map((feature, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                key={i} 
                className="group relative bg-white dark:bg-slate-800/50 backdrop-blur-lg border border-slate-200 dark:border-slate-700 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} text-white mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 font-medium leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 bg-gradient-to-b from-transparent to-indigo-50/50 dark:to-indigo-950/20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-indigo-600 dark:bg-indigo-900/80 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-400 opacity-20 rounded-full blur-3xl"></div>
            
            <h2 className="relative z-10 text-3xl md:text-5xl font-black text-white mb-6">Ready to secure your medical seat?</h2>
            <p className="relative z-10 text-indigo-100 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">Join thousands of successful aspirants who cracked NEET with our comprehensive mock tests.</p>
            <Link to="/register" className="relative z-10 inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-indigo-600 bg-white rounded-2xl hover:bg-indigo-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}