import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return setError('Only @gmail.com email addresses are allowed.');
    }
    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }
    try {
      setError('');
      await signup(email, password, name);
      navigate('/login');
    } catch (err) {
      setError('Failed to create an account');
    }
  }


  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-gradient-to-br from-blue-50/90 via-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-md w-full p-8 sm:p-10 rounded-[2rem] relative overflow-hidden mt-8 mb-8">
        <div className="absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none"></div>
        <div className="relative z-10">
          <div>
            <h2 className="mt-2 text-center text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Create Account</h2>
            <p className="mt-3 text-center text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300">Start your journey to crack NEET</p>
          </div>
          {error && <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-xl font-bold text-sm shadow-sm" role="alert">{error}</div>}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-extrabold text-black dark:text-white mb-1.5 ml-1">Full Name</label>
                <input type="text" required className="block w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-bold placeholder-slate-400" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-black dark:text-white mb-1.5 ml-1">Email Address</label>
                <input type="email" required className="block w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-bold placeholder-slate-400" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-black dark:text-white mb-1.5 ml-1">Password</label>
                <input type="password" required className="block w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-bold placeholder-slate-400" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-extrabold text-black dark:text-white mb-1.5 ml-1">Confirm Password</label>
                <input type="password" required className="block w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800 text-black dark:text-white focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-bold placeholder-slate-400" placeholder="••••••••" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="group relative w-full flex justify-center py-3.5 px-4 text-base font-black rounded-xl text-white bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 shadow-xl shadow-black/20 transition-all transform hover:-translate-y-0.5">
                Create Account
              </button>
            </div>
            
            <div className="text-center mt-6 text-sm font-bold text-slate-700 dark:text-slate-300">
              Already have an account? <Link to="/login" className="ml-1 font-black text-primary hover:text-primary/80 underline decoration-2 underline-offset-2">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}