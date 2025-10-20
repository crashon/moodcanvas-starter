const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorizeRoles } = require('../middleware/auth');
const { validateReview, validateReviewResponse, validate } = require('../middleware/validators');

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews with filtering (Admin only)
 * @access  Private (Admin only)
 * @query   status, rating, product, user, verified, sort, page, limit
 */
router.get(
  '/',
  authenticate,
  authorizeRoles('admin'),
  reviewController.getReviews
);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get current user's reviews
 * @access  Private (Authenticated users)
 * @query   product, rating, sort, page, limit
 */
router.get(
  '/my-reviews',
  authenticate,
  reviewController.getMyReviews
);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a specific product (Public)
 * @access  Public
 * @param   productId - Product ID
 * @query   rating, verified, sort, page, limit
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get single review by ID
 * @access  Public
 * @param   id - Review ID
 */
router.get('/:id', reviewController.getReview);

/**
 * @route   POST /api/reviews
 * @desc    Create a new review (Authenticated users only)
 * @access  Private (Authenticated users)
 * @body    product, rating, title, comment, images
 */
router.post(
  '/',
  authenticate,
  validateReview,
  validate,
  reviewController.createReview
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review (Review author only)
 * @access  Private (Review author or Admin)
 * @param   id - Review ID
 * @body    rating, title, comment, images
 */
router.put(
  '/:id',
  authenticate,
  validateReview,
  validate,
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review (Review author or Admin only)
 * @access  Private (Review author or Admin)
 * @param   id - Review ID
 */
router.delete(
  '/:id',
  authenticate,
  reviewController.deleteReview
);

/**
 * @route   PUT /api/reviews/:id/status
 * @desc    Update review status (Admin only)
 * @access  Private (Admin only)
 * @param   id - Review ID
 * @body    status ('pending', 'approved', 'rejected')
 */
router.put(
  '/:id/status',
  authenticate,
  authorizeRoles('admin'),
  reviewController.updateReviewStatus
);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark review as helpful (Authenticated users)
 * @access  Private (Authenticated users)
 * @param   id - Review ID
 */
router.post(
  '/:id/helpful',
  authenticate,
  reviewController.markReviewHelpful
);

/**
 * @route   POST /api/reviews/:id/response
 * @desc    Add shop owner response to review (Shop owner or Admin)
 * @access  Private (Shop owner of the product's shop or Admin)
 * @param   id - Review ID
 * @body    response (text)
 */
router.post(
  '/:id/response',
  authenticate,
  authorizeRoles('shop_owner', 'admin'),
  validateReviewResponse,
  validate,
  reviewController.addReviewResponse
);

module.exports = router;
