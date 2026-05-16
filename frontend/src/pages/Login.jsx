import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return setError('Only @gmail.com email addresses are allowed.');
    }
    try {
      setError('');
      const data = await login(email, password);
      navigate(data.redirectTo || '/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in');
    }
  }



  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 shadow-2xl max-w-md w-full p-8 sm:p-10 rounded-[2rem] relative z-10">
        <div className="relative z-10">
          <div>
            <h2 className="mt-2 text-center text-3xl sm:text-4xl font-black text-black dark:text-white tracking-tight">Welcome Back</h2>
            <p className="mt-3 text-center text-base font-black text-black dark:text-white">Sign in to continue your preparation</p>
          </div>
          {error && <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-900 p-4 rounded-xl font-black text-sm shadow-sm" role="alert">{error}</div>}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Email Address</label>
                <input type="email" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="you@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-black text-black dark:text-white mb-2 ml-1">Password</label>
                <input type="password" required className="block w-full px-4 py-4 rounded-xl border-2 border-black dark:border-white bg-white dark:bg-slate-900 text-black dark:text-white focus:ring-4 focus:ring-black/20 dark:focus:ring-white/20 outline-none transition-all shadow-sm font-black placeholder-slate-500" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="group relative w-full flex justify-center py-4 px-4 text-lg font-black rounded-xl text-white bg-black hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-black/30 shadow-xl transition-all">
                Sign In to Account
              </button>
            </div>
            
            <div className="text-center mt-6 text-base font-black text-black dark:text-white">
              Don't have an account? <Link to="/register" className="ml-1 font-black text-blue-700 dark:text-blue-400 hover:underline decoration-2 underline-offset-4">Sign up now</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}