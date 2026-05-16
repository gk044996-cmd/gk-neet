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
      <div className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-2xl max-w-md w-full p-8 sm:p-10 rounded-[2rem] relative z-10 mt-8 mb-8">
        <div className="relative z-10">
          <div>
            <h2 className="mt-2 text-center text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Create Account</h2>
            <p className="mt-3 text-center text-base font-black text-black dark:text-white">Start your journey to crack NEET</p>
          </div>
          {error && <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-900 p-4 rounded-xl font-black text-sm shadow-sm" role="alert">{error}</div>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Full Name</label>
                <input type="text" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Email Address</label>
                <input type="email" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Password</label>
                <input type="password" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Confirm Password</label>
                <input type="password" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="••••••••" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="group relative w-full flex justify-center py-4 px-4 text-lg font-black rounded-xl text-white bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-black/30 shadow-xl transition-all">
                Create Account
              </button>
            </div>
            
            <div className="text-center mt-6 text-base font-black text-black dark:text-white">
              Already have an account? <Link to="/login" className="ml-1 font-black text-blue-700 dark:text-blue-400 hover:underline decoration-2 underline-offset-4">Log in</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}