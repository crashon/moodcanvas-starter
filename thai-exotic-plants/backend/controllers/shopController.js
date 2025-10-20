const Shop = require('../models/Shop');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get all shops
// @route   GET /api/v1/shops
// @access  Public
exports.getShops = async (req, res, next) => {
  try {
    let query = {};

    // Filter by active status
    if (req.query.isActive !== undefined) {
      query.isActive = req.query.isActive;
    }

    // Filter by verified status
    if (req.query.isVerified !== undefined) {
      query.isVerified = req.query.isVerified;
    }

    // Search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const total = await Shop.countDocuments(query);

    const shops = await Shop.find(query)
      .populate('owner', 'name email')
      .sort(req.query.sort || '-createdAt')
      .skip(startIndex)
      .limit(limit);

    // Add products count for each shop
    const shopsWithStats = await Promise.all(
      shops.map(async (shop) => {
        const productsCount = await Product.countDocuments({ 
          shop: shop._id, 
          isActive: true 
        });
        return {
          ...shop.toObject(),
          productsCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: shops.length,
      total,
      data: shopsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single shop
// @route   GET /api/v1/shops/:id
// @access  Public
exports.getShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Get shop products
    const products = await Product.find({ 
      shop: shop._id, 
      isActive: true 
    }).select('name koreanName price images isRare isFeatured');

    res.status(200).json({
      success: true,
      data: {
        ...shop.toObject(),
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop by slug
// @route   GET /api/v1/shops/slug/:slug
// @access  Public
exports.getShopBySlug = async (req, res, next) => {
  try {
    const shop = await Shop.findOne({ slug: req.params.slug })
      .populate('owner', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Get shop products
    const products = await Product.find({ 
      shop: shop._id, 
      isActive: true 
    }).limit(12);

    res.status(200).json({
      success: true,
      data: {
        ...shop.toObject(),
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new shop
// @route   POST /api/v1/shops
// @access  Private (Admin)
exports.createShop = async (req, res, next) => {
  try {
    const { name, description, owner, contact, address } = req.body;

    // Check if owner exists and doesn't have a shop
    const user = await User.findById(owner);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다'
      });
    }

    if (user.shop) {
      return res.status(400).json({
        success: false,
        message: '이 사용자는 이미 샵을 소유하고 있습니다'
      });
    }

    // Create shop
    const shop = await Shop.create({
      name,
      description,
      owner,
      contact,
      address
    });

    // Update user with shop reference
    user.shop = shop._id;
    user.role = 'shop_owner';
    await user.save();

    res.status(201).json({
      success: true,
      data: shop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shop
// @route   PUT /api/v1/shops/:id
// @access  Private (Shop Owner, Admin)
exports.updateShop = async (req, res, next) => {
  try {
    let shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && shop.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 샵을 수정할 권한이 없습니다'
      });
    }

    // Don't allow changing owner
    delete req.body.owner;

    shop = await Shop.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shop
// @route   DELETE /api/v1/shops/:id
// @access  Private (Admin)
exports.deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Check if shop has products
    const productsCount = await Product.countDocuments({ shop: shop._id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: '상품이 있는 샵은 삭제할 수 없습니다. 먼저 모든 상품을 삭제해주세요.'
      });
    }

    // Update owner user role
    await User.findByIdAndUpdate(shop.owner, {
      $unset: { shop: 1 },
      role: 'customer'
    });

    await shop.deleteOne();

    res.status(200).json({
      success: true,
      message: '샵이 삭제되었습니다'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop statistics
// @route   GET /api/v1/shops/:id/statistics
// @access  Private (Shop Owner, Admin)
exports.getShopStatistics = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (req.user.role !== 'admin' && shop.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: '이 샵의 통계를 조회할 권한이 없습니다'
      });
    }

    // Get products statistics
    const products = await Product.find({ shop: shop._id });
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.isActive).length;
    const totalStock = products.reduce((sum, p) => sum + p.stockQuantity, 0);
    const lowStockProducts = products.filter(p => p.stockQuantity < 10).length;

    // Get orders statistics
    const Order = require('../models/Order');
    const orders = await Order.find({ 'items.shop': shop._id });
    
    let totalOrders = 0;
    let totalRevenue = 0;
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.shop.toString() === shop._id.toString()) {
          totalOrders++;
          totalRevenue += item.subtotal;
        }
      });
    });

    // Top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.shop.toString() === shop._id.toString()) {
          const productId = item.product.toString();
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              name: item.koreanName,
              quantity: 0,
              revenue: 0
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.subtotal;
        }
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        shop: {
          id: shop._id,
          name: shop.name
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          totalStock,
          lowStock: lowStockProducts
        },
        orders: {
          total: totalOrders,
          revenue: totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shop verification status
// @route   PUT /api/v1/shops/:id/verify
// @access  Private (Admin)
exports.verifyShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isVerified: req.body.isVerified },
      { new: true, runValidators: true }
    );

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: '샵을 찾을 수 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: shop
    });
  } catch (error) {
    next(error);
  }
};
