const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByShop
} = require('../controllers/productController');

const { protect, authorize } = require('../middleware/auth');
const { productValidation, validate, validateId } = require('../middleware/validators');

const router = express.Router();

router
  .route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('shop_owner', 'admin'),
    productValidation,
    validate,
    createProduct
  );

router.route('/featured').get(getFeaturedProducts);

router.route('/shop/:shopId').get(getProductsByShop);

router
  .route('/:id')
  .get(validateId, validate, getProduct)
  .put(
    protect,
    authorize('shop_owner', 'admin'),
    validateId,
    productValidation,
    validate,
    updateProduct
  )
  .delete(
    protect,
    authorize('shop_owner', 'admin'),
    validateId,
    validate,
    deleteProduct
  );

module.exports = router;
