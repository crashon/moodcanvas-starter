// Shop Modal Functions for Thai Exotic Plants
// Modals for creating and editing shops

const ShopModals = {
    // Show shop create modal
    showCreateShopModal: () => {
        const content = `
            <form id="create-shop-form" class="space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        샵 이름 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           name="name" 
                           id="shop-name"
                           required
                           placeholder="예: 태국 희귀식물 전문점"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        샵 설명 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="description" 
                              id="shop-description"
                              required
                              placeholder="샵에 대한 설명을 입력하세요"
                              rows="4"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이메일 <span class="text-red-500">*</span>
                        </label>
                        <input type="email" 
                               name="email" 
                               id="shop-email"
                               required
                               placeholder="shop@example.com"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            전화번호 <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" 
                               name="phone" 
                               id="shop-phone"
                               required
                               placeholder="02-1234-5678"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        주소
                    </label>
                    <input type="text" 
                           name="street" 
                           id="shop-street"
                           placeholder="서울시 강남구 논현로 123"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" 
                               name="city" 
                               id="shop-city"
                               placeholder="도시"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <input type="text" 
                               name="country" 
                               id="shop-country"
                               placeholder="국가"
                               value="대한민국"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        로고 URL
                    </label>
                    <input type="url" 
                           name="logo" 
                           id="shop-logo"
                           placeholder="https://example.com/logo.png"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        배너 URL
                    </label>
                    <input type="url" 
                           name="banner" 
                           id="shop-banner"
                           placeholder="https://example.com/banner.png"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="flex space-x-4 pt-4">
                    <button type="button" 
                            onclick="Modal.close()" 
                            class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" 
                            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                        <i class="fas fa-check mr-2"></i>샵 생성
                    </button>
                </div>
            </form>
        `;

        Modal.show({
            title: '새 샵 생성',
            content: content,
            size: 'large',
            closeOnOverlay: false
        });

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('create-shop-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await ShopModals.handleCreateShop(new FormData(form));
                });
            }
        }, 100);
    },

    // Handle shop creation
    handleCreateShop: async (formData) => {
        const shopData = {
            name: formData.get('name'),
            description: formData.get('description'),
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                country: formData.get('country')
            },
            logo: formData.get('logo') || undefined,
            banner: formData.get('banner') || undefined
        };

        const result = await ShopManager.createShop(shopData);

        if (result.success) {
            Modal.close();
            
            // Reload shops if on shops page
            if (typeof loadShops === 'function') {
                loadShops();
            }
            // Reload admin shops if on admin page
            if (typeof loadAdminShops === 'function') {
                loadAdminShops();
            }
        }
    },

    // Show shop edit modal
    showEditShopModal: async (shopId) => {
        // Load shop data
        const shop = await ShopManager.getShopById(shopId);
        if (!shop) {
            Utils.showToast('샵을 찾을 수 없습니다', 'error');
            return;
        }

        const content = `
            <form id="edit-shop-form" class="space-y-4">
                <input type="hidden" name="shopId" value="${shopId}">
                
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        샵 이름 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           name="name" 
                           required
                           value="${shop.name || ''}"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        샵 설명 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="description" 
                              required
                              rows="4"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">${shop.description || ''}</textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            이메일 <span class="text-red-500">*</span>
                        </label>
                        <input type="email" 
                               name="email" 
                               required
                               value="${shop.contact?.email || ''}"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            전화번호 <span class="text-red-500">*</span>
                        </label>
                        <input type="tel" 
                               name="phone" 
                               required
                               value="${shop.contact?.phone || ''}"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        주소
                    </label>
                    <input type="text" 
                           name="street" 
                           value="${shop.address?.street || ''}"
                           placeholder="서울시 강남구 논현로 123"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-2">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" 
                               name="city" 
                               value="${shop.address?.city || ''}"
                               placeholder="도시"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <input type="text" 
                               name="country" 
                               value="${shop.address?.country || '대한민국'}"
                               placeholder="국가"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        로고 URL
                    </label>
                    <input type="url" 
                           name="logo" 
                           value="${shop.logo || ''}"
                           placeholder="https://example.com/logo.png"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        배너 URL
                    </label>
                    <input type="url" 
                           name="banner" 
                           value="${shop.banner || ''}"
                           placeholder="https://example.com/banner.png"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="flex space-x-4 pt-4">
                    <button type="button" 
                            onclick="Modal.close()" 
                            class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" 
                            class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                        <i class="fas fa-save mr-2"></i>저장
                    </button>
                </div>
            </form>
        `;

        Modal.show({
            title: '샵 정보 수정',
            content: content,
            size: 'large',
            closeOnOverlay: false
        });

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('edit-shop-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await ShopModals.handleEditShop(new FormData(form));
                });
            }
        }, 100);
    },

    // Handle shop editing
    handleEditShop: async (formData) => {
        const shopId = formData.get('shopId');
        const shopData = {
            name: formData.get('name'),
            description: formData.get('description'),
            contact: {
                email: formData.get('email'),
                phone: formData.get('phone')
            },
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                country: formData.get('country')
            },
            logo: formData.get('logo') || undefined,
            banner: formData.get('banner') || undefined
        };

        const result = await ShopManager.updateShop(shopId, shopData);

        if (result.success) {
            Modal.close();
            
            // Reload shops if on shops page
            if (typeof loadShops === 'function') {
                loadShops();
            }
            // Reload admin shops if on admin page
            if (typeof loadAdminShops === 'function') {
                loadAdminShops();
            }
        }
    }
};

// Export ShopModals
window.ShopModals = ShopModals;

console.log('✅ Shop Modals loaded');
