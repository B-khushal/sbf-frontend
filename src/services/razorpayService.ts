import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Rmp68AvXeC3M3w',
  key_secret: import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

export const createOrder = async (amount: number, currency: string = 'INR') => {
  try {
    const options = {
      amount: amount,
      currency: currency,
      receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = (
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) => {
  try {
    const secret = import.meta.env.VITE_RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';
    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', secret)
      .update(sign.toString())
      .digest('hex');

    return razorpay_signature === expectedSign;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}; 