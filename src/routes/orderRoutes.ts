import express from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  createOrder
} from '../controllers/orderController';

const router = express.Router();

// Create Razorpay order
router.post('/create-razorpay-order', createRazorpayOrder);

// Verify Razorpay payment
router.post('/verify-payment', verifyRazorpayPayment);

// Create order in database
router.post('/', createOrder);

export default router; 