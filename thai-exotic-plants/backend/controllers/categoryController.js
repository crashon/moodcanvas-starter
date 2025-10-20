const Category = require('../models/Category');
const { validationResult } = require('express-validator');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        
        res.json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 조회에 실패했습니다.',
            error: error.message
        });
    }
};

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
const getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '카테고리를 찾을 수 없습니다.'
            });
        }
        
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 조회에 실패했습니다.',
            error: error.message
        });
    }
};

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 올바르지 않습니다.',
                errors: errors.array()
            });
        }

        const { name, name_en, description, icon, parent_id, is_active = true } = req.body;

        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ 
            name: { $regex: new RegExp(`^${name}$`, 'i') } 
        });
        
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: '이미 같은 이름의 카테고리가 존재합니다.'
            });
        }

        const category = await Category.create({
            name,
            name_en,
            description,
            icon,
            parent_id,
            is_active
        });

        res.status(201).json({
            success: true,
            message: '카테고리가 생성되었습니다.',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 생성에 실패했습니다.',
            error: error.message
        });
    }
};

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private/Admin
const updateCategory = async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: '입력 데이터가 올바르지 않습니다.',
                errors: errors.array()
            });
        }

        const { name, name_en, description, icon, parent_id, is_active } = req.body;

        // Check if category exists
        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '카테고리를 찾을 수 없습니다.'
            });
        }

        // Check if name is being changed and if new name already exists
        if (name && name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: '이미 같은 이름의 카테고리가 존재합니다.'
                });
            }
        }

        // Update category
        category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name,
                name_en,
                description,
                icon,
                parent_id,
                is_active,
                updated_at: new Date()
            },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            message: '카테고리가 업데이트되었습니다.',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 업데이트에 실패했습니다.',
            error: error.message
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private/Admin
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '카테고리를 찾을 수 없습니다.'
            });
        }

        // Check if category has products
        const Product = require('../models/Product');
        const productsCount = await Product.countDocuments({ category_id: req.params.id });
        
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `이 카테고리에 ${productsCount}개의 상품이 있어 삭제할 수 없습니다.`
            });
        }

        // Check if category has subcategories
        const subcategoriesCount = await Category.countDocuments({ parent_id: req.params.id });
        
        if (subcategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `이 카테고리에 ${subcategoriesCount}개의 하위 카테고리가 있어 삭제할 수 없습니다.`
            });
        }

        await Category.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: '카테고리가 삭제되었습니다.'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 삭제에 실패했습니다.',
            error: error.message
        });
    }
};

// @desc    Get category tree
// @route   GET /api/v1/categories/tree
// @access  Public
const getCategoryTree = async (req, res) => {
    try {
        const categories = await Category.find({ is_active: true }).sort({ name: 1 });
        
        // Build category tree
        const buildTree = (parentId = null) => {
            return categories
                .filter(cat => cat.parent_id === parentId)
                .map(cat => ({
                    ...cat.toObject(),
                    children: buildTree(cat._id.toString())
                }));
        };

        const categoryTree = buildTree();

        res.json({
            success: true,
            data: categoryTree
        });
    } catch (error) {
        console.error('Get category tree error:', error);
        res.status(500).json({
            success: false,
            message: '카테고리 트리 조회에 실패했습니다.',
            error: error.message
        });
    }
};

module.exports = {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryTree
};