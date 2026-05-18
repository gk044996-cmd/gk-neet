import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { BASE_URL } from '../config';

export default function Register() {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const triggerError = (msg) => {
    setError(msg);
    setSuccessMsg('');
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSendOTP = async () => {
    if (!email) return triggerError('Please enter your email first.');
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return triggerError('Only @gmail.com email addresses are allowed.');
    }
    
    setIsOtpLoading(true);
    try {
      setError('');
      const res = await fetch(`${BASE_URL}/users/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      
      setOtpSent(true);
      setCooldown(30);
      setSuccessMsg('OTP sent to your email. Expires in 5 mins.');
    } catch (err) {
      triggerError(err.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) return triggerError('Please enter the OTP.');
    setIsOtpLoading(true);
    try {
      setError('');
      const res = await fetch(`${BASE_URL}/users/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      
      setOtpVerified(true);
      setSuccessMsg('✅ Email Verified Successfully');
      setError('');
    } catch (err) {
      triggerError(err.message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      return triggerError('Only @gmail.com email addresses are allowed.');
    }
    if (!otpVerified) {
      return triggerError('Please verify your email with OTP first.');
    }
    if (password !== passwordConfirm) {
      return triggerError('Passwords do not match');
    }
    if (password.length < 6) {
      return triggerError('Password must be at least 6 characters.');
    }
    
    setIsLoading(true);
    try {
      setError('');
      await signup(email, password, name);
      navigate('/login');
    } catch (err) {
      triggerError('Failed to create an account');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
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
          className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10 rounded-[2.5rem] relative overflow-hidden my-8"
        >
          {/* Top Border Glow Effect */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />

          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex flex-col items-center"
            >
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-cyan-400 border border-blue-500/30">
                <Sparkles size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2">Create Account</h2>
              <p className="text-slate-400 font-medium">Start your journey to crack NEET</p>
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

          {successMsg && !error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 p-4 rounded-2xl font-semibold text-sm text-center shadow-[0_0_15px_rgba(16,185,129,0.15)]"
            >
              {successMsg}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-cyan-400 transition-colors">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <User size={20} />
                  </div>
                  <input 
                    type="text" 
                    required 
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600" 
                    placeholder="John Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-blue-400 transition-colors">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    required 
                    disabled={otpVerified}
                    className="block w-full pl-11 pr-28 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600 disabled:opacity-50" 
                    placeholder="you@gmail.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                  />
                  {!otpVerified && (
                    <div className="absolute inset-y-0 right-1 flex items-center">
                      <button 
                        type="button" 
                        onClick={handleSendOTP} 
                        disabled={isOtpLoading || cooldown > 0}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isOtpLoading ? <Loader2 size={14} className="animate-spin mx-auto"/> : cooldown > 0 ? `Wait ${cooldown}s` : otpSent ? 'Resend OTP' : 'Verify'}
                      </button>
                    </div>
                  )}
                  {otpVerified && (
                    <div className="absolute inset-y-0 right-3 flex items-center text-emerald-400">
                      <CheckCircle2 size={20} />
                    </div>
                  )}
                </div>
              </div>

              {otpSent && !otpVerified && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="relative group"
                >
                  <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 ml-1">Enter 6-Digit OTP</label>
                  <div className="relative flex gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      className="block w-full px-4 py-3.5 rounded-2xl border border-emerald-500/50 bg-emerald-900/20 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all shadow-inner font-bold tracking-widest text-center" 
                      placeholder="••••••" 
                      value={otp} 
                      onChange={(e) => setOtp(e.target.value)} 
                    />
                    <button 
                      type="button" 
                      onClick={handleVerifyOTP} 
                      disabled={isOtpLoading || otp.length < 6}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-6 py-3.5 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                    >
                      {isOtpLoading ? <Loader2 size={18} className="animate-spin mx-auto"/> : 'Confirm'}
                    </button>
                  </div>
                </motion.div>
              )}

              <div className="relative group">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    disabled={!otpVerified}
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                </div>
              </div>

              <div className="relative group">
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ml-1 transition-colors ${!otpVerified ? 'text-slate-600' : 'text-slate-400 group-focus-within:text-indigo-400'}`}>Confirm Password</label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${!otpVerified ? 'text-slate-600' : 'text-slate-500 group-focus-within:text-indigo-400'}`}>
                    <Lock size={20} />
                  </div>
                  <input 
                    type="password" 
                    required 
                    disabled={!otpVerified}
                    className="block w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-700 bg-slate-900/50 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all shadow-inner font-medium placeholder-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                    placeholder="••••••••" 
                    value={passwordConfirm} 
                    onChange={(e) => setPasswordConfirm(e.target.value)} 
                  />
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="pt-4"
            >
              <button 
                type="submit" 
                disabled={isLoading || !otpVerified}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-lg font-bold rounded-2xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Create Account
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
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline decoration-2 underline-offset-4 transition-colors">
                Log in
              </Link>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}