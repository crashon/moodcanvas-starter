const Product = require('../models/Product');
const Shop = require('../models/Shop');

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    // Filtering
    const queryObj = { ...req.query };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach(el => delete queryObj[el]);

    // Advanced filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    let query = Product.find(JSON.parse(queryStr));

    // Search
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }

    // Filter by category
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    // Filter by shop
    if (req.query.shop) {
      query = query.find({ shop: req.query.shop });
    }

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query = query.find({ isActive: req.query.isActive });
    }

    // Filter by featured
    if (req.query.isFeatured) {
      query = query.find({ isFeatured: true });
    }

    // Filter by rare
    if (req.query.isRare) {
      query = query.find({ isRare: true });
    }

    // Sorting
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Field limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate('shop', 'name slug')
                 .populate('category', 'name nameEn');

    // Execute query
    const products = await query;

    // Pagination result
    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name slug contact')
      .populate('category', 'name nameEn')
      .populate({
        path: 'reviews',
        match: { status: 'approved' },
        populate: { path: 'user', select: 'name avatar' }
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private (Shop Owner, Admin)
exports.createProduct = async (req, res, next) => {
  try {
    // Check if shop exists
    const shop = await Shop.findById(req.body.shop);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Check shop ownership
    if (req.user.role !== 'admin' && shop.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 샵에 상품을 추가할 권한이 없습니다'
      });
    }

    const product = await Product.create(req.body);

    // Update shop statistics
    await shop.updateStatistics();

    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private (Shop Owner, Admin)
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id).populate('shop');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && product.shop.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 상품을 수정할 권한이 없습니다'
      });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private (Shop Owner, Admin)
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('shop');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: '상품을 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && product.shop.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 상품을 삭제할 권한이 없습니다'
      });
    }

    await product.deleteOne();

    // Update shop statistics
    const shop = await Shop.findById(product.shop._id);
    await shop.updateStatistics();

    res.status(200).json({
      success: true,
      message: '상품이 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.getFeatured();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by shop
// @route   GET /api/v1/products/shop/:shopId
// @access  Public
exports.getProductsByShop = async (req, res, next) => {
  try {
    const products = await Product.getByShop(req.params.shopId);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    next(error);
  }
};
