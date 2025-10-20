// Shop Manager Module for Thai Exotic Plants
// Handles shop CRUD operations and statistics

const ShopManager = {
    currentShop: null,
    shops: [],

    // Initialize shop manager
    init: async () => {
        await ShopManager.loadShops();
        
        // If user is shop owner, load their shop
        if (Auth.currentUser && Auth.currentUser.role === 'shop_owner') {
            await ShopManager.loadMyShop();
        }
    },

    // Load all shops
    loadShops: async (filters = {}) => {
        try {
            ShopManager.shops = await DataSource.getShops(filters);
            console.log(`✅ Loaded ${ShopManager.shops.length} shops`);
            return ShopManager.shops;
        } catch (error) {
            console.error('Error loading shops:', error);
            Utils.showToast('샵 목록을 불러올 수 없습니다', 'error');
            return [];
        }
    },

    // Load current user's shop (for shop owners)
    loadMyShop: async () => {
        try {
            if (!Auth.currentUser) {
                throw new Error('User not authenticated');
            }

            // Get shops filtered by owner
            const shops = await DataSource.getShops({ owner: Auth.currentUser.id });
            
            if (shops && shops.length > 0) {
                ShopManager.currentShop = shops[0];
                console.log('✅ Loaded my shop:', ShopManager.currentShop.name);
                return ShopManager.currentShop;
            } else {
                console.log('No shop found for current user');
                return null;
            }
        } catch (error) {
            console.error('Error loading my shop:', error);
            return null;
        }
    },

    // Get shop by ID
    getShopById: async (shopId) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.shops.getById(shopId);
                return response.data;
            } else {
                const shop = ShopManager.shops.find(s => s.id === shopId);
                return shop || null;
            }
        } catch (error) {
            console.error('Error getting shop:', error);
            return null;
        }
    },

    // Get shop by slug
    getShopBySlug: async (slug) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.shops.getBySlug(slug);
                return response.data;
            } else {
                const shop = ShopManager.shops.find(s => s.slug === slug);
                return shop || null;
            }
        } catch (error) {
            console.error('Error getting shop by slug:', error);
            return null;
        }
    },

    // Create new shop
    createShop: async (shopData) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.shops.create(shopData);
                
                if (response.success && response.data) {
                    const newShop = response.data;
                    ShopManager.shops.push(newShop);
                    ShopManager.currentShop = newShop;
                    
                    console.log('✅ Shop created:', newShop.name);
                    Utils.showToast('샵이 성공적으로 생성되었습니다', 'success');
                    
                    return {
                        success: true,
                        shop: newShop
                    };
                } else {
                    throw new Error(response.message || '샵 생성 실패');
                }
            } else {
                // LocalStorage mode
                const newShop = {
                    id: Utils.generateId(),
                    ...shopData,
                    owner: Auth.currentUser.id,
                    slug: Utils.slugify(shopData.name),
                    status: 'active',
                    verified: false,
                    featured: false,
                    statistics: {
                        totalProducts: 0,
                        totalSales: 0,
                        totalRevenue: 0,
                        averageRating: 0,
                        totalReviews: 0
                    },
                    createdAt: new Date().toISOString()
                };

                ShopManager.shops.push(newShop);
                Storage.set('shops', ShopManager.shops);
                ShopManager.currentShop = newShop;
                
                Utils.showToast('샵이 성공적으로 생성되었습니다 (데모 모드)', 'success');
                
                return {
                    success: true,
                    shop: newShop
                };
            }
        } catch (error) {
            console.error('Error creating shop:', error);
            Utils.showToast(error.message || '샵 생성에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Update shop
    updateShop: async (shopId, shopData) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.shops.update(shopId, shopData);
                
                if (response.success && response.data) {
                    const updatedShop = response.data;
                    
                    // Update in local array
                    const index = ShopManager.shops.findIndex(s => s._id === shopId || s.id === shopId);
                    if (index !== -1) {
                        ShopManager.shops[index] = updatedShop;
                    }
                    
                    // Update current shop if it's the one being updated
                    if (ShopManager.currentShop && (ShopManager.currentShop._id === shopId || ShopManager.currentShop.id === shopId)) {
                        ShopManager.currentShop = updatedShop;
                    }
                    
                    console.log('✅ Shop updated:', updatedShop.name);
                    Utils.showToast('샵이 성공적으로 수정되었습니다', 'success');
                    
                    return {
                        success: true,
                        shop: updatedShop
                    };
                } else {
                    throw new Error(response.message || '샵 수정 실패');
                }
            } else {
                // LocalStorage mode
                const index = ShopManager.shops.findIndex(s => s.id === shopId);
                
                if (index === -1) {
                    throw new Error('샵을 찾을 수 없습니다');
                }

                const updatedShop = {
                    ...ShopManager.shops[index],
                    ...shopData,
                    updatedAt: new Date().toISOString()
                };

                ShopManager.shops[index] = updatedShop;
                Storage.set('shops', ShopManager.shops);
                
                if (ShopManager.currentShop && ShopManager.currentShop.id === shopId) {
                    ShopManager.currentShop = updatedShop;
                }
                
                Utils.showToast('샵이 성공적으로 수정되었습니다 (데모 모드)', 'success');
                
                return {
                    success: true,
                    shop: updatedShop
                };
            }
        } catch (error) {
            console.error('Error updating shop:', error);
            Utils.showToast(error.message || '샵 수정에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Delete shop
    deleteShop: async (shopId) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            // Use Modal.confirm if available, otherwise fallback to confirm
            const confirmed = window.Modal 
                ? await Modal.confirm({
                    title: '샵 삭제',
                    message: '정말로 이 샵을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
                    confirmText: '삭제',
                    confirmClass: 'bg-red-600 hover:bg-red-700'
                })
                : confirm('정말로 이 샵을 삭제하시겠습니까?');
            
            if (!confirmed) {
                return { success: false, cancelled: true };
            }

            if (DataSource.mode === 'api') {
                const response = await API.shops.delete(shopId);
                
                if (response.success) {
                    // Remove from local array
                    ShopManager.shops = ShopManager.shops.filter(s => s._id !== shopId && s.id !== shopId);
                    
                    // Clear current shop if it's the deleted one
                    if (ShopManager.currentShop && (ShopManager.currentShop._id === shopId || ShopManager.currentShop.id === shopId)) {
                        ShopManager.currentShop = null;
                    }
                    
                    console.log('✅ Shop deleted');
                    Utils.showToast('샵이 성공적으로 삭제되었습니다', 'success');
                    
                    return { success: true };
                } else {
                    throw new Error(response.message || '샵 삭제 실패');
                }
            } else {
                // LocalStorage mode
                ShopManager.shops = ShopManager.shops.filter(s => s.id !== shopId);
                Storage.set('shops', ShopManager.shops);
                
                if (ShopManager.currentShop && ShopManager.currentShop.id === shopId) {
                    ShopManager.currentShop = null;
                }
                
                Utils.showToast('샵이 성공적으로 삭제되었습니다 (데모 모드)', 'success');
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting shop:', error);
            Utils.showToast(error.message || '샵 삭제에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Get shop statistics
    getShopStatistics: async (shopId) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.shops.getStatistics(shopId);
                return response.data;
            } else {
                // Calculate from localStorage
                const shop = ShopManager.shops.find(s => s.id === shopId);
                if (!shop) return null;

                const products = Storage.get('products') || [];
                const orders = Storage.get('orders') || [];
                const reviews = Storage.get('reviews') || [];

                const shopProducts = products.filter(p => p.shop_id === shopId);
                const shopOrders = orders.filter(o => 
                    o.items.some(item => 
                        shopProducts.some(p => p.id === item.product_id)
                    )
                );

                const totalRevenue = shopOrders.reduce((sum, order) => sum + (order.total || 0), 0);
                
                const productIds = shopProducts.map(p => p.id);
                const shopReviews = reviews.filter(r => productIds.includes(r.product_id));
                const averageRating = shopReviews.length > 0
                    ? shopReviews.reduce((sum, r) => sum + r.rating, 0) / shopReviews.length
                    : 0;

                return {
                    totalProducts: shopProducts.length,
                    totalSales: shopOrders.length,
                    totalRevenue: totalRevenue,
                    averageRating: averageRating,
                    totalReviews: shopReviews.length
                };
            }
        } catch (error) {
            console.error('Error getting shop statistics:', error);
            return null;
        }
    },

    // Verify shop (Admin only)
    verifyShop: async (shopId, verified) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 샵을 인증할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.shops.verify(shopId, verified);
                
                if (response.success && response.data) {
                    const updatedShop = response.data;
                    
                    // Update in local array
                    const index = ShopManager.shops.findIndex(s => s._id === shopId || s.id === shopId);
                    if (index !== -1) {
                        ShopManager.shops[index] = updatedShop;
                    }
                    
                    const status = verified ? '인증되었습니다' : '인증이 해제되었습니다';
                    Utils.showToast(`샵이 ${status}`, 'success');
                    
                    return { success: true, shop: updatedShop };
                } else {
                    throw new Error(response.message || '샵 인증 변경 실패');
                }
            } else {
                // LocalStorage mode
                const index = ShopManager.shops.findIndex(s => s.id === shopId);
                
                if (index !== -1) {
                    ShopManager.shops[index].verified = verified;
                    Storage.set('shops', ShopManager.shops);
                    
                    const status = verified ? '인증되었습니다' : '인증이 해제되었습니다';
                    Utils.showToast(`샵이 ${status} (데모 모드)`, 'success');
                    
                    return { success: true, shop: ShopManager.shops[index] };
                }
                
                throw new Error('샵을 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('Error verifying shop:', error);
            Utils.showToast(error.message || '샵 인증 변경에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Render shop card
    renderShopCard: (shop) => {
        const verifiedBadge = shop.verified 
            ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"><i class="fas fa-check-circle"></i> 인증됨</span>'
            : '';

        const featuredBadge = shop.featured
            ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"><i class="fas fa-star"></i> 추천</span>'
            : '';

        const statusColor = {
            active: 'green',
            inactive: 'gray',
            closed: 'red'
        }[shop.status] || 'gray';

        return `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                <div class="h-32 bg-gradient-to-r from-green-400 to-blue-500" style="background-image: url('${shop.banner || ''}'); background-size: cover; background-position: center;"></div>
                <div class="p-4">
                    <div class="flex items-center mb-3">
                        <img src="${shop.logo || 'https://via.placeholder.com/50'}" 
                             alt="${shop.name}" 
                             class="w-12 h-12 rounded-full mr-3 object-cover">
                        <div class="flex-1">
                            <h3 class="font-bold text-lg">${shop.name}</h3>
                            <div class="flex items-center space-x-2 mt-1">
                                ${verifiedBadge}
                                ${featuredBadge}
                                <span class="bg-${statusColor}-100 text-${statusColor}-800 text-xs px-2 py-1 rounded">${shop.status}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${shop.description || ''}</p>
                    
                    <div class="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                        <div><i class="fas fa-box text-green-600"></i> ${shop.statistics?.totalProducts || 0}개 상품</div>
                        <div><i class="fas fa-star text-yellow-500"></i> ${(shop.statistics?.averageRating || 0).toFixed(1)}</div>
                        <div><i class="fas fa-shopping-cart text-blue-600"></i> ${shop.statistics?.totalSales || 0}건 판매</div>
                        <div><i class="fas fa-comment text-purple-600"></i> ${shop.statistics?.totalReviews || 0}개 리뷰</div>
                    </div>
                    
                    <div class="flex space-x-2">
                        <a href="shop-detail.html?id=${shop._id || shop.id}" 
                           class="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition text-sm">
                            샵 보기
                        </a>
                        ${Auth.hasRole('admin') ? `
                            <button onclick="ShopManager.verifyShop('${shop._id || shop.id}', ${!shop.verified})" 
                                    class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm">
                                <i class="fas fa-${shop.verified ? 'times' : 'check'}-circle"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
};

// Export ShopManager
window.ShopManager = ShopManager;

console.log('✅ ShopManager module loaded');
