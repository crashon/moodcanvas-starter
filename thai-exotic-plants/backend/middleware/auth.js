const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: '인증 토큰이 필요합니다'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '사용자를 찾을 수 없습니다'
        });
      }

      if (!req.user.isActive) {
        return res.status(401).json({
          success: false,
          message: '비활성화된 계정입니다'
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} 역할은 이 작업을 수행할 수 없습니다`
      });
    }
    next();
  };
};

// Check shop ownership
exports.checkShopOwnership = async (req, res, next) => {
  try {
    const shopId = req.params.shopId || req.body.shop;

    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: '샵 ID가 필요합니다'
      });
    }

    // Admin can access any shop
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns this shop
    if (!req.user.shop || req.user.shop.toString() !== shopId) {
      return res.status(403).json({
        success: false,
        message: '이 샵에 대한 권한이 없습니다'
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
