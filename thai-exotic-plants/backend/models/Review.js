const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, '상품 정보가 필요합니다']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '사용자 정보가 필요합니다']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rating: {
    type: Number,
    required: [true, '평점을 선택해주세요'],
    min: [1, '평점은 1점 이상이어야 합니다'],
    max: [5, '평점은 5점 이하여야 합니다']
  },
  title: {
    type: String,
    maxlength: [100, '제목은 100자를 초과할 수 없습니다']
  },
  comment: {
    type: String,
    required: [true, '리뷰 내용을 입력해주세요'],
    maxlength: [1000, '리뷰는 1000자를 초과할 수 없습니다']
  },
  images: [{
    url: String,
    publicId: String
  }],
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ user: 1 });

// Update product ratings after save
reviewSchema.post('save', async function() {
  const Product = mongoose.model('Product');
  const product = await Product.findById(this.product);
  
  if (product) {
    const Review = mongoose.model('Review');
    const reviews = await Review.find({ 
      product: this.product, 
      status: 'approved' 
    });
    
    if (reviews.length > 0) {
      const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      product.ratings.average = Math.round(average * 10) / 10;
      product.ratings.count = reviews.length;
      await product.save();
    }
  }
});

// Method to mark as helpful
reviewSchema.methods.markHelpful = async function(userId) {
  if (!this.helpful.users.includes(userId)) {
    this.helpful.users.push(userId);
    this.helpful.count += 1;
    await this.save();
  }
};

module.exports = mongoose.model('Review', reviewSchema);
