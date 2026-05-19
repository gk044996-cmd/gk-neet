const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const razorpay = require('../utils/razorpay');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Create order
router.post('/create-order', protect, async (req, res) => {
  try {
    const options = {
      amount: 4900, // amount in the smallest currency unit (paise)
      currency: 'INR',
      receipt: `receipt_order_${req.user._id}_${Date.now()}`
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, error: 'Failed to create Razorpay order' });
    }

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Verify payment
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // Payment verified, update user
      const user = await User.findById(req.user._id);
      
      user.isPremium = true;
      user.premiumPlan = 'monthly';
      user.premiumActivatedAt = new Date();
      // Add 30 days
      user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.premiumBadge = true;
      user.razorpayOrderId = razorpay_order_id;
      user.razorpayPaymentId = razorpay_payment_id;
      
      await user.save();

      res.json({ success: true, message: 'Payment verified successfully. Premium unlocked!', user });
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature sent!' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
