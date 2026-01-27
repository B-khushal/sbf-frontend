import api from './api';

export interface Order {
  _id: string;
  orderNumber: string;
  shippingDetails: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
    deliveryDate: string;
    timeSlot: string;
  };
  items: {
    product: {
      _id: string;
      title: string;
      price: number;
      images: string[];
    };
    quantity: number;
    price: number;
    finalPrice: number;
    customizations?: any;
  }[];
  paymentDetails: {
    method: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  totalAmount: number;
  currency?: string;
  currencyRate?: number;
  originalCurrency?: string;
  status: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
  trackingHistory?: {
    status: 'order_placed' | 'received' | 'being_made' | 'out_for_delivery' | 'delivered' | 'cancelled';
    timestamp: string;
    message?: string;
    updatedBy?: string;
  }[];
  createdAt: string;
}

// Create order
export const createOrder = async (orderData: any) => {
  const response = await api.post('/orders', orderData);
  // ✅ Ensure response includes orderNumber
  if (response.data && response.data.orderNumber) {
    console.log("✅ Order Created:", response.data.orderNumber); // Debugging log
  }
  return response.data;
};

// Get order by ID
export const getOrderById = async (orderId: string): Promise<Order> => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

// Pay for order
export const payOrder = async (orderId: string, paymentResult: any) => {
  const response = await api.put(`/orders/${orderId}/pay`, paymentResult);
  return response.data;
};

// Get my orders
export const getMyOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/myorders');
  return response.data;
};

// Admin: Get all orders
export const getAllOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders');
  return response.data;
};

// Admin: Update order to delivered
export const deliverOrder = async (orderId: string) => {
  const response = await api.put(`/orders/${orderId}/deliver`, {});
  return response.data;
};

// Admin: Update order status
export const updateOrderStatus = async (orderId: string, status: string) => {
  const response = await api.put(`/orders/${orderId}/status`, { status });
  return response.data;
};

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/myorders');
  return response.data;
};
