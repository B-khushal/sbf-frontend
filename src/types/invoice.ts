export interface InvoiceOrder {
  orderNumber: string;
  createdAt: string;
  shippingDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
    deliveryOption: 'self' | 'gift';
    giftMessage?: string;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiverPhone?: string;
    receiverAddress?: string;
    receiverApartment?: string;
    receiverCity?: string;
    receiverState?: string;
    receiverZipCode?: string;
    timeSlot: string;
    deliveryDate: string;
  };
  items: Array<{
    product: {
      name: string;
      images: string[];
      price: number;
      discount?: number;
    };
    quantity: number;
    price: number;
    finalPrice: number;
  }>;
  totalAmount: number;

  shippingFee?: number;
  status: string;
  paymentDetails: {
    method: string;
    status: string;
    transactionId?: string;
  };
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  shipping: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    apartment?: string;
    city: string;
    state: string;
    zipCode: string;
    notes?: string;
    deliveryOption: 'self' | 'gift';
    giftMessage?: string;
    receiverFirstName?: string;
    receiverLastName?: string;
    receiverEmail?: string;
    receiverPhone?: string;
    receiverAddress?: string;
    receiverApartment?: string;
    receiverCity?: string;
    receiverState?: string;
    receiverZipCode?: string;
    timeSlot: string;
    deliveryDate: string;
  };
  items: Array<{
    id: string;
    title: string;
    image: string;
    price: number;
    quantity: number;
    product: {
      name: string;
      images: string[];
      price: number;
      discount?: number;
    };
  }>;
  subtotal: number;

  total: number;
  deliveryFee: number;
  payment: {
    method: string;
    paymentId?: string;
    status: string;
    transactionId?: string;
  };
  status: string;
  currency?: string;
  currencyRate?: number;
  originalCurrency?: string;
} 