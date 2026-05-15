import React from 'react';
import SEO from '../components/SEO';
import { BookOpen } from 'lucide-react';

export default function ChapterTests() {
  const subjects = ['Physics', 'Chemistry', 'Botany', 'Zoology'];
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO title="Chapter Tests" description="Practice subject-wise and chapter-wise mini mock tests." />
      <h1 className="text-3xl font-bold mb-2">Chapter-wise Practice</h1>
      <p className="text-slate-500 mb-8">Focus on your weak areas with mini mock tests.</p>

      {subjects.map(sub => (
        <div key={sub} className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><BookOpen className="text-primary"/> {sub}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="glass-panel p-5 rounded-2xl flex justify-between items-center group cursor-pointer hover:border-primary/50 transition-colors">
                <div>
                  <h4 className="font-semibold mb-1">Important Chapter {i}</h4>
                  <p className="text-xs text-slate-500">50 Questions • 45 Mins</p>
                </div>
                <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
