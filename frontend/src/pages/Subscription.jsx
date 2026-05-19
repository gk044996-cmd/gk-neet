import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Crown, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';

export default function Subscription() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const res = await loadRazorpay();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      
      const orderRes = await fetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      const orderData = await orderRes.json();
      
      if (!orderData.success) {
        alert('Server error. Are you online?');
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'GK NEET MOCK',
        description: 'Premium Subscription',
        image: '/logo.png', // Fallback
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              window.location.href = '/payment-success';
            } else {
              alert('Payment Verification Failed!');
            }
          } catch (err) {
            console.error(err);
            alert('Something went wrong during verification.');
          }
        },
        prefill: {
          name: currentUser.name || currentUser.username || '',
          email: currentUser.email || '',
          contact: ''
        },
        theme: {
          color: '#6366f1' // Indigo
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error(error);
      alert('Something went wrong!');
    }
    setLoading(false);
  };

  const features = [
    'Access to all Premium Mock Tests',
    'Detailed Test Result Analytics',
    'Exclusive Premium Badge',
    'Global Leaderboard Access',
    'New Tests Added Weekly'
  ];

  return (
    <div className="min-h-screen bg-[#0B0D14] flex flex-col items-center justify-center py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      <SEO title="Premium Subscription" />
      
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />
      </div>

      <div className="max-w-4xl w-full relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-sm tracking-wide mb-6">
            <Sparkles className="w-4 h-4" />
            ELEVATE YOUR PREPARATION
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">Premium</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto font-medium">
            Join the elite tier of NEET aspirants. Get unlimited access to high-yield mock tests, advanced analytics, and global rankings.
          </p>
        </motion.div>

        {/* Pricing Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-lg mx-auto relative group"
        >
          {/* Animated Glow Border */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-500 rounded-[2.5rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-gradient-xy"></div>
          
          <div className="relative bg-[#151821] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden backdrop-blur-xl">
            {/* Most Popular Ribbon */}
            <div className="absolute top-6 right-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-black px-4 py-1 rounded-l-full shadow-lg shadow-orange-500/30 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              MOST POPULAR
            </div>

            <div className="p-8 sm:p-10 border-b border-white/5">
              <h3 className="text-xl font-bold text-slate-300 mb-2">NEET Pro Access</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-6xl font-black text-white tracking-tighter">₹49</span>
                <span className="text-xl font-semibold text-slate-500">/mo</span>
              </div>
              <p className="text-slate-400 font-medium">Everything you need to conquer NEET, billed monthly.</p>
            </div>

            <div className="p-8 sm:p-10 bg-[#1A1D27]/50">
              <ul className="space-y-5 mb-10">
                {features.map((feature, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-start gap-4 group/item"
                  >
                    <div className="relative shrink-0 mt-0.5">
                      <div className="absolute inset-0 bg-cyan-400/30 blur-md rounded-full scale-110 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                      <CheckCircle2 className="w-6 h-6 text-cyan-400 relative z-10" />
                    </div>
                    <span className="text-slate-300 font-medium group-hover/item:text-white transition-colors">{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {currentUser?.isPremium ? (
                <div className="w-full relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-30"></div>
                  <button disabled className="relative w-full flex items-center justify-center gap-2 px-8 py-5 border border-emerald-500/50 text-xl font-black rounded-2xl text-white bg-emerald-500/10 cursor-not-allowed shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <ShieldCheck className="w-6 h-6" /> Premium Active
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full relative group/btn flex items-center justify-center gap-2 px-8 py-5 text-xl font-black rounded-2xl text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:via-blue-500 hover:to-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:scale-95"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      Buy Premium Now <Crown className="w-5 h-5 ml-1 transition-transform group-hover/btn:-rotate-12 group-hover/btn:scale-110" />
                    </>
                  )}
                  {/* Button Glare */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover/btn:animate-[shimmer_1.5s_infinite] pointer-events-none rounded-2xl"></div>
                </button>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Secure Payment Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-10 text-slate-500 text-sm font-medium flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" /> Secure 256-bit encrypted payments via Razorpay
        </motion.p>
      </div>
    </div>
  );
}
