import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <h3 className="text-2xl font-bold text-white mb-4">GK NEET MOCK</h3>
          <p className="mb-4">Prepare for your NEET exam with real simulation, detailed analytics, and professional feedback.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary">Home</a></li>
            <li><a href="#" className="hover:text-primary">Mock Tests</a></li>
            <li><a href="#" className="hover:text-primary">Leaderboard</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Support</h4>
          <ul className="space-y-2">
            <li><a href="#" className="hover:text-primary">FAQ</a></li>
            <li><a href="#" className="hover:text-primary">Contact Us</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-center">
        <p>&copy; {new Date().getFullYear()} GK NEET MOCK. All rights reserved.</p>
      </div>
    </footer>
  );
}