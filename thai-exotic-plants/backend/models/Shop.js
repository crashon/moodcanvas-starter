const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '샵 이름을 입력해주세요'],
    trim: true,
    unique: true,
    maxlength: [100, '샵 이름은 100자를 초과할 수 없습니다']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, '샵 설명을 입력해주세요'],
    maxlength: [1000, '설명은 1000자를 초과할 수 없습니다']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '샵 오너를 지정해주세요']
  },
  contact: {
    email: {
      type: String,
      required: [true, '이메일을 입력해주세요'],
      match: [/^\S+@\S+\.\S+$/, '올바른 이메일 형식이 아닙니다']
    },
    phone: {
      type: String,
      required: [true, '전화번호를 입력해주세요']
    },
    whatsapp: String,
    line: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Thailand'
    },
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  logo: {
    url: String,
    publicId: String
  },
  banner: {
    url: String,
    publicId: String
  },
  socialMedia: {
    facebook: String,
    instagram: String,
    twitter: String,
    website: String
  },
  businessInfo: {
    registrationNumber: String,
    taxId: String,
    businessType: String
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  statistics: {
    totalProducts: {
      type: Number,
      default: 0
    },
    totalSales: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  settings: {
    autoApproveOrders: {
      type: Boolean,
      default: false
    },
    minOrderAmount: {
      type: Number,
      default: 0
    },
    shippingMethods: [String],
    paymentMethods: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
shopSchema.index({ slug: 1 });
shopSchema.index({ owner: 1 });
shopSchema.index({ isActive: 1, isVerified: 1 });
shopSchema.index({ name: 'text', description: 'text' });

// Virtual for products
shopSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'shop'
});

// Generate slug before saving
shopSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Update statistics
shopSchema.methods.updateStatistics = async function() {
  const Product = mongoose.model('Product');
  const products = await Product.find({ shop: this._id });
  
  this.statistics.totalProducts = products.length;
  this.statistics.totalSales = products.reduce((sum, p) => sum + p.soldCount, 0);
  
  await this.save();
};

module.exports = mongoose.model('Shop', shopSchema);
