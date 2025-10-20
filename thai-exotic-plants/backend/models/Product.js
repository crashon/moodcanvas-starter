const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: [true, '샵을 선택해주세요']
  },
  name: {
    type: String,
    required: [true, '영문명을 입력해주세요'],
    trim: true,
    maxlength: [200, '영문명은 200자를 초과할 수 없습니다']
  },
  koreanName: {
    type: String,
    required: [true, '한글명을 입력해주세요'],
    trim: true,
    maxlength: [200, '한글명은 200자를 초과할 수 없습니다']
  },
  thaiName: {
    type: String,
    trim: true,
    maxlength: [200, '태국어명은 200자를 초과할 수 없습니다']
  },
  scientificName: {
    type: String,
    trim: true,
    maxlength: [200, '학명은 200자를 초과할 수 없습니다']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, '상품 설명을 입력해주세요'],
    maxlength: [2000, '설명은 2000자를 초과할 수 없습니다']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, '카테고리를 선택해주세요']
  },
  price: {
    type: Number,
    required: [true, '가격을 입력해주세요'],
    min: [0, '가격은 0보다 커야 합니다']
  },
  priceUSD: {
    type: Number,
    min: [0, 'USD 가격은 0보다 커야 합니다']
  },
  stockQuantity: {
    type: Number,
    required: [true, '재고 수량을 입력해주세요'],
    min: [0, '재고는 0 이상이어야 합니다'],
    default: 0
  },
  images: [{
    url: String,
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    publicId: String,
    thumbnail: String
  }],
  difficultyLevel: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  isRare: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  specifications: {
    height: String,
    width: String,
    potSize: String,
    sunlight: String,
    watering: String,
    humidity: String,
    temperature: String
  },
  tags: [String],
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
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }],
  soldCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
productSchema.index({ shop: 1, isActive: 1 });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ name: 'text', koreanName: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

// Virtual for stock status
productSchema.virtual('stockStatus').get(function() {
  if (this.stockQuantity === 0) return 'out_of_stock';
  if (this.stockQuantity < 10) return 'low_stock';
  return 'in_stock';
});

// Generate slug before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Update USD price based on exchange rate (example: 1 USD = 33 THB)
productSchema.pre('save', function(next) {
  if (this.isModified('price') && !this.priceUSD) {
    this.priceUSD = Math.round((this.price / 33) * 100) / 100;
  }
  next();
});

// Method to check if in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.stockQuantity >= quantity;
};

// Method to reduce stock
productSchema.methods.reduceStock = async function(quantity) {
  if (!this.isInStock(quantity)) {
    throw new Error('재고가 부족합니다');
  }
  this.stockQuantity -= quantity;
  this.soldCount += quantity;
  await this.save();
};

// Static method to get featured products
productSchema.statics.getFeatured = function() {
  return this.find({ isFeatured: true, isActive: true })
    .populate('shop', 'name')
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(12);
};

// Static method to get by shop
productSchema.statics.getByShop = function(shopId) {
  return this.find({ shop: shopId, isActive: true })
    .populate('category', 'name')
    .sort('-createdAt');
};

module.exports = mongoose.model('Product', productSchema);
