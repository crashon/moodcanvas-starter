const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate and calculate order
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).populate('shop');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `상품 ID ${item.product}를 찾을 수 없습니다`
        });
      }

      if (!product.isInStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `${product.koreanName}의 재고가 부족합니다`
        });
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        shop: product.shop._id,
        name: product.name,
        koreanName: product.koreanName,
        image: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Calculate shipping and total
    const shippingFee = subtotal >= 50000 ? 0 : 5000; // Free shipping over 50,000 THB
    const tax = 0; // No tax for now
    const total = subtotal + shippingFee + tax;

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      pricing: {
        subtotal,
        shippingFee,
        tax,
        total
      },
      notes
    });

    // Reduce product stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      await product.reduceStock(item.quantity);
    }

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/v1/orders
// @access  Private (Admin)
exports.getOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let query = {};

    // Filter by status
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus) {
      query['paymentInfo.paymentStatus'] = req.query.paymentStatus;
    }

    const total = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('items.product', 'koreanName')
      .populate('items.shop', 'name')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'koreanName images')
      .populate('items.shop', 'name contact');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // Check ownership (customer or shop owner or admin)
    if (
      req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user.id &&
      !order.items.some(item => item.shop.owner?.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: '이 주문을 조회할 권한이 없습니다'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my orders
// @route   GET /api/v1/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .populate('items.product', 'koreanName images')
      .populate('items.shop', 'name')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Shop Owner, Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    await order.updateStatus(status, note, req.user.id);

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/v1/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: '주문을 찾을 수 없습니다'
      });
    }

    // Check ownership
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: '이 주문을 취소할 권한이 없습니다'
      });
    }

    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: '이 주문은 취소할 수 없습니다'
      });
    }

    order.cancelReason = req.body.reason;
    await order.updateStatus('cancelled', req.body.reason, req.user.id);

    // Restore product stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stockQuantity += item.quantity;
        product.soldCount -= item.quantity;
        await product.save();
      }
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get shop orders
// @route   GET /api/v1/orders/shop/:shopId
// @access  Private (Shop Owner, Admin)
exports.getShopOrders = async (req, res, next) => {
  try {
    const orders = await Order.getByShop(req.params.shopId);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};
