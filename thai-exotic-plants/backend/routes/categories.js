const express = require('express');
const { body } = require('express-validator');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const categoryValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('카테고리 이름은 필수입니다.')
        .isLength({ min: 2, max: 50 })
        .withMessage('카테고리 이름은 2-50자 사이여야 합니다.'),
    body('name_en')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('영문 이름은 50자 이하여야 합니다.'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('설명은 500자 이하여야 합니다.'),
    body('icon')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('아이콘은 50자 이하여야 합니다.'),
    body('parent_id')
        .optional()
        .isMongoId()
        .withMessage('부모 카테고리 ID가 올바르지 않습니다.'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('활성 상태는 true/false여야 합니다.')
];

// Public routes
router.get('/', getCategories);
router.get('/tree', getCategoryTree);
router.get('/:id', getCategory);

// Protected routes (require authentication)
router.use(protect);

// Admin routes
router.post('/', authorize('admin'), categoryValidation, createCategory);
router.put('/:id', authorize('admin'), categoryValidation, updateCategory);
router.delete('/:id', authorize('admin'), deleteCategory);

module.exports = router;