const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '고객 정보가 필요합니다']
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    name: String,
    koreanName: String,
    image: String,
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    name: String,
    phone: String,
    street: {
      type: String,
      required: [true, '주소를 입력해주세요']
    },
    city: {
      type: String,
      required: [true, '도시를 입력해주세요']
    },
    state: String,
    country: {
      type: String,
      required: [true, '국가를 입력해주세요']
    },
    zipCode: String
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank_transfer', 'paypal', 'cash_on_delivery'],
    default: 'bank_transfer'
  },
  paymentInfo: {
    transactionId: String,
    paidAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    tax: {
      type: Number,
      default: 0
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  shippingInfo: {
    carrier: String,
    trackingNumber: String,
    shippedAt: Date,
    estimatedDelivery: Date,
    deliveredAt: Date
  },
  notes: String,
  cancelReason: String,
  refundReason: String,
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1, createdAt: -1 });
orderSchema.index({ 'items.shop': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ 'paymentInfo.paymentStatus': 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 10000);
  }
  next();
});

// Calculate totals
orderSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('pricing')) {
    // Calculate subtotal
    this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
    
    // Calculate total
    this.pricing.total = 
      this.pricing.subtotal + 
      this.pricing.shippingFee + 
      this.pricing.tax - 
      this.pricing.discount;
  }
  next();
});

// Add status to history
orderSchema.methods.updateStatus = async function(newStatus, note, userId) {
  this.orderStatus = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note: note,
    updatedBy: userId
  });
  await this.save();
};

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.orderStatus);
};

// Static method to get orders by shop
orderSchema.statics.getByShop = function(shopId) {
  return this.find({ 'items.shop': shopId })
    .populate('customer', 'name email phone')
    .sort('-createdAt');
};

// Static method to get revenue statistics
orderSchema.statics.getRevenueStats = async function(shopId, startDate, endDate) {
  const match = {
    'paymentInfo.paymentStatus': 'completed',
    createdAt: { $gte: startDate, $lte: endDate }
  };
  
  if (shopId) {
    match['items.shop'] = mongoose.Types.ObjectId(shopId);
  }
  
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$pricing.total' },
        totalOrders: { $sum: 1 },
        averageOrderValue: { $avg: '$pricing.total' }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
