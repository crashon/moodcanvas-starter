const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '유효성 검사 실패',
      errors: errors.array()
    });
  }
  next();
};

// Product validation rules
exports.productValidation = [
  body('name').trim().notEmpty().withMessage('영문명을 입력해주세요'),
  body('koreanName').trim().notEmpty().withMessage('한글명을 입력해주세요'),
  body('description').trim().notEmpty().withMessage('상품 설명을 입력해주세요'),
  body('category').notEmpty().withMessage('카테고리를 선택해주세요'),
  body('shop').notEmpty().withMessage('샵을 선택해주세요'),
  body('price').isNumeric().withMessage('가격은 숫자여야 합니다')
    .custom(value => value >= 0).withMessage('가격은 0 이상이어야 합니다'),
  body('stockQuantity').isInt({ min: 0 }).withMessage('재고는 0 이상의 정수여야 합니다')
];

// Shop validation rules
exports.shopValidation = [
  body('name').trim().notEmpty().withMessage('샵 이름을 입력해주세요'),
  body('description').trim().notEmpty().withMessage('샵 설명을 입력해주세요'),
  body('contact.email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('contact.phone').trim().notEmpty().withMessage('전화번호를 입력해주세요')
];

// User registration validation
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('이름을 입력해주세요'),
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다')
];

// User login validation
exports.loginValidation = [
  body('email').isEmail().withMessage('올바른 이메일 형식이 아닙니다'),
  body('password').notEmpty().withMessage('비밀번호를 입력해주세요')
];

// Order validation
exports.orderValidation = [
  body('items').isArray({ min: 1 }).withMessage('주문 상품이 필요합니다'),
  body('items.*.product').notEmpty().withMessage('상품 ID가 필요합니다'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('수량은 1 이상이어야 합니다'),
  body('shippingAddress.street').trim().notEmpty().withMessage('주소를 입력해주세요'),
  body('shippingAddress.city').trim().notEmpty().withMessage('도시를 입력해주세요'),
  body('shippingAddress.country').trim().notEmpty().withMessage('국가를 입력해주세요')
];

// Review validation
exports.reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('평점은 1-5 사이여야 합니다'),
  body('comment').trim().notEmpty().withMessage('리뷰 내용을 입력해주세요')
];

// Category validation
exports.categoryValidation = [
  body('name').trim().notEmpty().withMessage('카테고리 이름을 입력해주세요')
];

// ID param validation
exports.validateId = [
  param('id').isMongoId().withMessage('올바른 ID 형식이 아닙니다')
];

// Pagination validation
exports.paginationValidation = [
  query('page').optional().isInt({ min: 1 }).withMessage('페이지는 1 이상이어야 합니다'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit은 1-100 사이여야 합니다')
];
