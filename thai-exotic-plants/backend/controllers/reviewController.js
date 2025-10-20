const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    let query = {};

    // Filter by product
    if (req.query.product) {
      query.product = req.query.product;
    }

    // Filter by user
    if (req.query.user) {
      query.user = req.query.user;
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    // Filter by rating
    if (req.query.rating) {
      query.rating = parseInt(req.query.rating);
    }

    // Filter by verified purchase
    if (req.query.isVerifiedPurchase !== undefined) {
      query.isVerifiedPurchase = req.query.isVerifiedPurchase;
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate('user', 'name avatar')
      .populate('product', 'name koreanName images')
      .sort(req.query.sort || '-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
exports.getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'name avatar')
      .populate('product', 'name koreanName images price')
      .populate('response.respondedBy', 'name');

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a product
// @route   GET /api/v1/products/:productId/reviews
// @access  Public
exports.getProductReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
      status: 'approved'
    })
      .populate('user', 'name avatar')
      .sort('-createdAt');

    // Calculate rating distribution
    const ratingDistribution = {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    };

    reviews.forEach(review => {
      ratingDistribution[review.rating]++;
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
      ratingDistribution
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/v1/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { product, rating, title, comment, images, order } = req.body;

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await Review.findOne({
      product,
      user: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: '이미 이 상품에 대한 리뷰를 작성하셨습니다'
      });
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    if (order) {
      const orderExists = await Order.findOne({
        _id: order,
        customer: req.user.id,
        'items.product': product,
        orderStatus: 'delivered'
      });
      isVerifiedPurchase = !!orderExists;
    }

    const review = await Review.create({
      product,
      user: req.user.id,
      rating,
      title,
      comment,
      images,
      order,
      isVerifiedPurchase
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 리뷰를 수정할 권한이 없습니다'
      });
    }

    // Only allow updating certain fields
    const allowedFields = ['rating', 'title', 'comment', 'images'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    review = await Review.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // Check ownership or admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 리뷰를 삭제할 권한이 없습니다'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: '리뷰가 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review status (approve/reject)
// @route   PUT /api/v1/reviews/:id/status
// @access  Private (Admin, Shop Owner)
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 상태입니다'
      });
    }

    const review = await Review.findById(req.params.id).populate({
      path: 'product',
      populate: { path: 'shop' }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // Check if user has permission (admin or shop owner)
    if (req.user.role !== 'admin') {
      if (!review.product.shop || review.product.shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '이 리뷰의 상태를 변경할 권한이 없습니다'
        });
      }
    }

    review.status = status;
    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark review as helpful
// @route   POST /api/v1/reviews/:id/helpful
// @access  Private
exports.markReviewHelpful = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    await review.markHelpful(req.user.id);

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add response to review
// @route   POST /api/v1/reviews/:id/response
// @access  Private (Shop Owner, Admin)
exports.addReviewResponse = async (req, res, next) => {
  try {
    const { text } = req.body;

    const review = await Review.findById(req.params.id).populate({
      path: 'product',
      populate: { path: 'shop' }
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: '리뷰를 찾을 수 없습니다'
      });
    }

    // Check if user has permission (admin or shop owner)
    if (req.user.role !== 'admin') {
      if (!review.product.shop || review.product.shop.owner.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: '이 리뷰에 답변할 권한이 없습니다'
        });
      }
    }

    review.response = {
      text,
      respondedBy: req.user.id,
      respondedAt: Date.now()
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my reviews
// @route   GET /api/v1/reviews/my
// @access  Private
exports.getMyReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('product', 'name koreanName images price')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};
