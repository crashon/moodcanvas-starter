const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { protect, authorize } = require('../middleware/auth');
const { shopValidation, validate } = require('../middleware/validators');

/**
 * @route   GET /api/shops
 * @desc    Get all shops with filtering, sorting, and pagination
 * @access  Public
 * @query   status, verified, featured, search, sort, page, limit
 */
router.get('/', shopController.getShops);

/**
 * @route   GET /api/shops/slug/:slug
 * @desc    Get shop by slug (URL-friendly identifier)
 * @access  Public
 * @param   slug - Shop slug
 */
router.get('/slug/:slug', shopController.getShopBySlug);

/**
 * @route   GET /api/shops/:id
 * @desc    Get shop by ID with full details
 * @access  Public
 * @param   id - Shop ID
 */
router.get('/:id', shopController.getShop);

/**
 * @route   POST /api/shops
 * @desc    Create a new shop (Shop Owner or Admin only)
 * @access  Private (shop_owner, admin)
 * @body    name, description, logo, banner, contact, address, socialMedia, businessHours
 */
router.post(
  '/',
  protect,
  authorize('shop_owner', 'admin'),
  shopValidation,
  validate,
  shopController.createShop
);

/**
 * @route   PUT /api/shops/:id
 * @desc    Update shop details
 * @access  Private (Shop Owner of this shop or Admin)
 * @param   id - Shop ID
 * @body    Fields to update
 */
router.put(
  '/:id',
  protect,
  authorize('shop_owner', 'admin'),
  shopValidation,
  validate,
  shopController.updateShop
);

/**
 * @route   DELETE /api/shops/:id
 * @desc    Delete shop (Soft delete - changes status to 'closed')
 * @access  Private (Shop Owner of this shop or Admin)
 * @param   id - Shop ID
 */
router.delete(
  '/:id',
  protect,
  authorize('shop_owner', 'admin'),
  shopController.deleteShop
);

/**
 * @route   GET /api/shops/:id/statistics
 * @desc    Get shop statistics (products, orders, revenue, ratings)
 * @access  Private (Shop Owner of this shop or Admin)
 * @param   id - Shop ID
 */
router.get(
  '/:id/statistics',
  protect,
  authorize('shop_owner', 'admin'),
  shopController.getShopStatistics
);

/**
 * @route   PUT /api/shops/:id/verify
 * @desc    Verify or unverify a shop (Admin only)
 * @access  Private (Admin only)
 * @param   id - Shop ID
 * @body    verified (boolean)
 */
router.put(
  '/:id/verify',
  protect,
  authorize('admin'),
  shopController.verifyShop
);

module.exports = router;
