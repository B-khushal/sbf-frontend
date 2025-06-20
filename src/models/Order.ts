import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  shippingDetails: {
    fullName: String,
    email: String,
    phone: String,
    address: String,
    apartment: String,
    city: String,
    state: String,
    zipCode: String,
    notes: String,
    deliveryDate: Date,
    timeSlot: String
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    }
  }],
  paymentDetails: {
    method: {
      type: String,
      required: true
    },
    paymentId: String,
    orderId: String
  },
  totalAmount: {
    type: Number,
    required: true
  },
  giftDetails: {
    message: String,
    recipientName: String,
    recipientEmail: String,
    recipientPhone: String,
    recipientAddress: String,
    recipientApartment: String,
    recipientCity: String,
    recipientState: String,
    recipientZipCode: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order; 