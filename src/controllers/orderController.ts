import { Request, Response } from 'express';
import { createOrder, verifyPayment } from '../services/razorpayService';
import Order from '../models/Order';

export const createRazorpayOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency } = req.body;
    
    const order = await createOrder(amount, currency);
    
    res.json({
      success: true,
      amount: order.amount,
      currency: order.currency,
      id: order.id
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
};

export const verifyRazorpayPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const isValid = verifyPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    res.json({
      success: isValid
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      shippingDetails,
      items,
      paymentDetails,
      totalAmount,
      giftDetails
    } = req.body;

    // Generate order number
    const orderNumber = `ORD${Date.now()}`;

    // Create order in database
    const order = await Order.create({
      orderNumber,
      shippingDetails,
      items,
      paymentDetails,
      totalAmount,
      giftDetails,
      status: 'confirmed'
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
}; 