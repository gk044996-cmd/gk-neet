import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Subscription() {
  const { currentUser, login } = useAuth();
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
        image: '/logo.png', // Fallback to whatever you have
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
              navigate('/payment-success');
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
          color: '#4f46e5'
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-4xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-2">
            Unlock <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Premium</span>
          </h2>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Supercharge your NEET preparation with exclusive mock tests and analytics.
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
          <div className="px-6 py-8 sm:p-10 sm:pb-6">
            <div>
              <h3 className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                Monthly Plan
              </h3>
            </div>
            <div className="mt-4 flex items-baseline text-6xl font-extrabold text-slate-900 dark:text-white">
              ₹49
              <span className="ml-1 text-2xl font-medium text-slate-500 dark:text-slate-400">/mo</span>
            </div>
            <p className="mt-5 text-lg text-slate-500 dark:text-slate-400">
              Get full access to all premium features for 30 days.
            </p>
          </div>
          <div className="px-6 pt-6 pb-8 sm:px-10 sm:pt-6">
            <ul className="space-y-4">
              {[
                'Access to all Premium Mock Tests',
                'Detailed Subject-wise Analytics',
                'Exclusive Premium Badge',
                'Priority Support',
                'New tests added weekly'
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-slate-700 dark:text-slate-300">{feature}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              {currentUser?.isPremium ? (
                <button
                  disabled
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-green-500 cursor-not-allowed"
                >
                  Already Premium
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1"
                >
                  {loading ? 'Processing...' : 'Buy Premium Now'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
