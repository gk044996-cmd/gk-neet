import React from 'react';
import SEO from '../components/SEO';
import { BookOpen, Lock, Clock, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChapterTests() {
  const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
  
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="Chapter Tests" description="Practice subject-wise and chapter-wise mini mock tests." />
      
      <div className="text-center mb-16">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 mb-6">
          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-widest">Targeted Practice</span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">
          Chapter-wise Tests
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
          Focus on your weak areas with targeted mini mock tests designed by NEET toppers.
        </motion.p>
      </div>

      <motion.div variants={containerVars} initial="hidden" animate="show">
        {subjects.map((sub, sIdx) => (
          <motion.div variants={itemVars} key={sub} className="mb-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                <BookOpen size={24} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white">{sub}</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => {
                const isPremium = i === 3;
                return (
                  <motion.div 
                    whileHover={{ y: -5 }}
                    key={i} 
                    className="group bg-white dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700/50 p-6 sm:p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col"
                  >
                    {isPremium && <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full"></div>}
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform">
                        {i}
                      </div>
                      {isPremium && (
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <Lock size={12} /> Premium
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">Important Chapter {i}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 relative z-10 line-clamp-2">Test your understanding of core concepts and problem-solving skills for this chapter.</p>
                    
                    <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400 mb-8 relative z-10">
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <FileText size={16} className="text-indigo-500" /> 50 Qs
                      </div>
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <Clock size={16} className="text-indigo-500" /> 45 Mins
                      </div>
                    </div>

                    <button className={`mt-auto w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md group-hover:shadow-lg relative z-10 ${isPremium ? 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white shadow-orange-500/20' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}>
                      {isPremium ? (
                        <>Unlock Now <Lock size={16} /></>
                      ) : (
                        <>Start Practice <span className="group-hover:translate-x-1 transition-transform">→</span></>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
