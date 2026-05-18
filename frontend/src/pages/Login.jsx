import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, CheckCircle2, KeyRound } from 'lucide-react';
import { BASE_URL } from '../config';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Handle cooldown timer for resend OTP
  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleForgotSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!forgotEmail) {
      setForgotError('Please enter your email.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await fetch(`${BASE_URL}/users/forgot-password/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setForgotMsg('OTP sent to your email.');
      setForgotStep(2);
      setCooldown(30);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyOTP = async (e) => {
    e.preventDefault();
    if (!forgotOtp || forgotOtp.length < 6) {
      setForgotError('Please enter a valid 6-digit OTP.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await fetch(`${BASE_URL}/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, type: 'reset' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setForgotMsg('OTP Verified! Enter new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await fetch(`${BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      
      setForgotMsg('Password reset successful! You can now log in.');
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotEmail('');
        setForgotOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotMsg('');
      }, 3000);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setForgotLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Only @gmail.com email addresses are allowed.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    
    setIsLoading(true);
    try {
      setError('');
      const data = await login(email, password);
      navigate(data.redirectTo || '/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to log in');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden"
        >
          {/* Top Border Glow Effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500" />

          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Welcome Back 👋</h2>
              <p className="text-slate-400 font-medium">Log in to continue your NEET preparation</p>
            </motion.div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl font-semibold text-sm text-center shadow-[0_0_15px_rgba(239,68,68,0.15)]"
            >
              {error}
            </motion.div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600" 
                    placeholder="you@gmail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button 
                  type="button" 
                  onClick={() => setShowForgot(true)}
                  className="text-xs font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-2"
            >
              <button 
                type="submit" 
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transform hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6 text-sm font-medium text-slate-400"
            >
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline decoration-2 underline-offset-4 transition-colors">
                Create one now
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowForgot(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl relative z-10 w-full max-w-md"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-black text-white mb-2">Reset Password</h3>
              <p className="text-slate-400 text-sm">
                {forgotStep === 1 && "Enter your email to receive a reset OTP."}
                {forgotStep === 2 && "Enter the 6-digit OTP sent to your email."}
                {forgotStep === 3 && "Create a new strong password."}
              </p>
            </div>

            {forgotError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm font-semibold text-center">
                {forgotError}
              </div>
            )}
            {forgotMsg && (
              <div className="mb-4 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-3 rounded-xl text-sm font-semibold text-center">
                {forgotMsg}
              </div>
            )}

            {forgotStep === 1 && (
              <form onSubmit={handleForgotSendOTP} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none" 
                    placeholder="you@gmail.com" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setShowForgot(false)}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={forgotLoading}
                    className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex justify-center disabled:opacity-50"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 2 && (
              <form onSubmit={handleForgotVerifyOTP} className="space-y-4">
                <div className="relative">
                  <input 
                    type="text" 
                    required 
                    maxLength={6}
                    className="block w-full px-4 py-3 rounded-xl border border-emerald-500/50 bg-emerald-900/20 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none text-center font-bold tracking-widest text-lg" 
                    placeholder="••••••" 
                    value={forgotOtp} 
                    onChange={(e) => setForgotOtp(e.target.value)} 
                  />
                </div>
                <div className="flex justify-between items-center px-1">
                  <button 
                    type="button" 
                    onClick={handleForgotSendOTP}
                    disabled={cooldown > 0 || forgotLoading}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 disabled:text-slate-500"
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-300"
                  >
                    Change Email
                  </button>
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={forgotLoading || forgotOtp.length < 6}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors flex justify-center disabled:opacity-50"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : 'Verify OTP'}
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <KeyRound size={20} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none" 
                    placeholder="New Password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    className="block w-full pl-11 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none" 
                    placeholder="Confirm New Password" 
                    value={confirmNewPassword} 
                    onChange={(e) => setConfirmNewPassword(e.target.value)} 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button 
                    type="submit" 
                    disabled={forgotLoading}
                    className="w-full py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors flex justify-center disabled:opacity-50"
                  >
                    {forgotLoading ? <Loader2 className="animate-spin" size={20} /> : 'Reset Password'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}