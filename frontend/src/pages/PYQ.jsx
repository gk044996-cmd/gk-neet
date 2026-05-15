import React, { useState } from 'react';
import SEO from '../components/SEO';
import { Search, Filter } from 'lucide-react';

export default function PYQ() {
  const [searchTerm, setSearchTerm] = useState('');

  const pyqYears = [2023, 2022, 2021, 2020, 2019, 2018, 2017];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Previous Year Questions" description="Practice NEET Previous Year Questions (PYQ) year-wise and chapter-wise." />
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Previous Year Questions</h1>
          <p className="text-slate-500">Practice actual NTA NEET papers from past years.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search year or subject..." 
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pyqYears.map(year => (
          <div key={year} className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-primary">NEET {year}</h3>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Official Paper</span>
            </div>
            <p className="text-sm text-slate-500 mb-6">Complete 180 questions with NTA answer key solutions.</p>
            <div className="mt-auto flex gap-3">
              <button className="flex-1 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors">Attempt Exam</button>
              <button className="flex-1 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors">Download PDF</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
