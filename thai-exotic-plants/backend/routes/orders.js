const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  getMyOrders,
  updateOrderStatus,
  cancelOrder,
  getShopOrders
} = require('../controllers/orderController');

const { protect, authorize, checkShopOwnership } = require('../middleware/auth');
const { orderValidation, validate, validateId } = require('../middleware/validators');

const router = express.Router();

router
  .route('/')
  .get(protect, authorize('admin'), getOrders)
  .post(protect, orderValidation, validate, createOrder);

router.route('/my').get(protect, getMyOrders);

router.route('/shop/:shopId')
  .get(protect, authorize('shop_owner', 'admin'), checkShopOwnership, getShopOrders);

router
  .route('/:id')
  .get(protect, validateId, validate, getOrder);

router
  .route('/:id/status')
  .put(protect, authorize('shop_owner', 'admin'), validateId, validate, updateOrderStatus);

router
  .route('/:id/cancel')
  .put(protect, validateId, validate, cancelOrder);

module.exports = router;
