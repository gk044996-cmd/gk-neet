import React from 'react';
import SEO from '../components/SEO';
import { Bookmark } from 'lucide-react';

export default function Bookmarks() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <SEO title="Bookmarked Questions" description="Review your saved difficult questions." />
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3"><Bookmark /> Bookmarks</h1>
      <p className="text-slate-500 mb-8">Revise your saved difficult questions here.</p>
      
      <div className="glass-panel p-10 rounded-3xl text-center">
        <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">No bookmarks yet</h3>
        <p className="text-slate-500">Star questions during your mock tests to save them here for quick revision.</p>
      </div>
    </div>
  );
}
