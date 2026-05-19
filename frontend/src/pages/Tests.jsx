import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, FileText, Lock, Unlock, TrendingUp, Calendar } from 'lucide-react';

export default function Tests() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [accessFilter, setAccessFilter] = useState('All');
  const [sortBy, setSortBy] = useState('latest');

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/api/tests`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        if (res.ok) {
          const data = await res.json();
          setTests(data);
        }
      } catch (err) {
        console.error('Failed to fetch tests', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTests();
  }, []);

  const types = ['All', ...new Set(tests.map(t => t.type || 'Custom Test'))];

  const filteredTests = tests
    .filter(t => 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(t => selectedType === 'All' ? true : t.type === selectedType)
    .filter(t => accessFilter === 'All' ? true : t.accessType === accessFilter)
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'duration') return b.duration - a.duration;
      return 0;
    });

  const handleTestClick = (e, test) => {
    e.preventDefault();
    if (test.accessType === 'premium' && !currentUser?.isPremium && currentUser?.role !== 'admin') {
      navigate('/premium');
    } else {
      navigate(`/test/${test._id}`);
    }
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVars = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
          All Mock Tests
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Browse our complete library of premium and free mock tests. 
          Filter by subject, access type, and find exactly what you need.
        </p>
      </motion.div>

      {/* Filters Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white dark:bg-[#22252D] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 mb-10 flex flex-col md:flex-row gap-4 md:items-end"
      >
        <div className="flex-1 w-full relative">
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 font-medium transition-shadow"
            />
          </div>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Subject/Type</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Access</label>
          <select 
            value={accessFilter} 
            onChange={(e) => setAccessFilter(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="All">All Tests</option>
            <option value="free">Free Only</option>
            <option value="premium">Premium Only</option>
          </select>
        </div>

        <div className="w-full md:w-48">
          <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Sort</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="duration">Longest Duration</option>
          </select>
        </div>
      </motion.div>

      {/* Tests Grid */}
      <motion.div variants={containerVars} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {filteredTests.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-500 dark:text-slate-400 font-medium text-lg">
            No tests found matching your filters.
          </div>
        ) : (
          filteredTests.map(test => {
            const isPremiumLocked = test.accessType === 'premium' && !currentUser?.isPremium && currentUser?.role !== 'admin';
            
            return (
              <motion.div 
                variants={itemVars} 
                key={test._id} 
                className="group flex flex-col bg-white dark:bg-[#22252D] border border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Premium Glow for cards */}
                {test.accessType === 'premium' && <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full"></div>}
                
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {test.type || 'Test'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                      {test.title}
                    </h3>
                  </div>
                  {test.accessType === 'premium' ? (
                    <span className="shrink-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] sm:text-xs font-bold uppercase px-3 py-1.5 rounded-full shadow-sm ml-3 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Premium
                    </span>
                  ) : (
                    <span className="shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] sm:text-xs font-bold uppercase px-3 py-1.5 rounded-full ml-3 flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> Free
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1 text-xs font-bold uppercase"><FileText className="w-3 h-3" /> Questions</span>
                    <span className="text-lg font-black text-slate-700 dark:text-slate-300">{test.totalQuestions || test.questions?.length || 0}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1 text-xs font-bold uppercase"><Clock className="w-3 h-3" /> Duration</span>
                    <span className="text-lg font-black text-slate-700 dark:text-slate-300">{test.duration}m</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1 text-xs font-bold uppercase"><TrendingUp className="w-3 h-3" /> Marks</span>
                    <span className="text-lg font-black text-slate-700 dark:text-slate-300">{test.totalMarks}</span>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80">
                    <span className="text-slate-400 flex items-center gap-1 text-xs font-bold uppercase"><Calendar className="w-3 h-3" /> Date</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                      {new Date(test.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                
                <div className="mt-auto relative z-10">
                  {isPremiumLocked ? (
                    <button 
                      onClick={(e) => handleTestClick(e, test)}
                      className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-bold rounded-xl transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:-translate-y-0.5"
                    >
                      <Lock className="w-5 h-5" /> Unlock Premium to Start
                    </button>
                  ) : (
                    <button 
                      onClick={(e) => handleTestClick(e, test)}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:-translate-y-0.5"
                    >
                      Start Test
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
