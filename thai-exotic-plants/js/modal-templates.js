// Modal Templates for Thai Exotic Plants
// Pre-built modal templates for common operations

const ModalTemplates = {
    // Shop creation/edit modal
    showShopModal: (shop = null) => {
        const isEdit = !!shop;
        
        Modal.showForm({
            title: isEdit ? '샵 수정' : '새 샵 만들기',
            fields: [
                {
                    name: 'name',
                    label: '샵 이름',
                    type: 'text',
                    placeholder: '예: 태국 식물 천국',
                    required: true,
                    value: shop?.name || ''
                },
                {
                    name: 'description',
                    label: '샵 설명',
                    type: 'textarea',
                    placeholder: '샵에 대한 설명을 입력하세요',
                    required: true,
                    value: shop?.description || ''
                },
                {
                    name: 'email',
                    label: '이메일',
                    type: 'email',
                    placeholder: 'shop@example.com',
                    required: true,
                    value: shop?.contact?.email || ''
                },
                {
                    name: 'phone',
                    label: '전화번호',
                    type: 'tel',
                    placeholder: '02-1234-5678',
                    required: true,
                    value: shop?.contact?.phone || ''
                },
                {
                    name: 'street',
                    label: '주소',
                    type: 'text',
                    placeholder: '서울시 강남구 테헤란로 123',
                    value: shop?.address?.street || ''
                },
                {
                    name: 'city',
                    label: '도시',
                    type: 'text',
                    placeholder: '서울',
                    value: shop?.address?.city || ''
                },
                {
                    name: 'country',
                    label: '국가',
                    type: 'text',
                    placeholder: '대한민국',
                    value: shop?.address?.country || '대한민국'
                }
            ],
            submitText: isEdit ? '수정' : '생성',
            onSubmit: async (data) => {
                const shopData = {
                    name: data.name,
                    description: data.description,
                    contact: {
                        email: data.email,
                        phone: data.phone
                    },
                    address: {
                        street: data.street,
                        city: data.city,
                        country: data.country
                    }
                };

                let result;
                if (isEdit) {
                    result = await ShopManager.updateShop(shop._id || shop.id, shopData);
                } else {
                    result = await ShopManager.createShop(shopData);
                }

                if (result.success) {
                    Modal.close();
                    // Refresh shop list if exists
                    if (typeof loadShops === 'function') {
                        loadShops();
                    }
                }
            }
        });
    },

    // Category creation/edit modal
    showCategoryModal: (category = null) => {
        const isEdit = !!category;

        // Get parent categories for dropdown
        const parentOptions = [{value: '', label: '없음 (최상위 카테고리)'}];
        if (CategoryManager.categories) {
            CategoryManager.categories
                .filter(c => !isEdit || (c._id !== category._id && c.id !== category.id))
                .forEach(c => {
                    parentOptions.push({
                        value: c._id || c.id,
                        label: `${c.icon || '📁'} ${c.name}`
                    });
                });
        }

        Modal.showForm({
            title: isEdit ? '카테고리 수정' : '새 카테고리 만들기',
            fields: [
                {
                    name: 'name',
                    label: '카테고리 이름',
                    type: 'text',
                    placeholder: '예: 열대식물',
                    required: true,
                    value: category?.name || ''
                },
                {
                    name: 'description',
                    label: '설명',
                    type: 'textarea',
                    placeholder: '카테고리 설명을 입력하세요',
                    value: category?.description || ''
                },
                {
                    name: 'icon',
                    label: '아이콘 (이모지)',
                    type: 'text',
                    placeholder: '🌴',
                    value: category?.icon || ''
                },
                {
                    name: 'parent',
                    label: '부모 카테고리',
                    type: 'select',
                    options: parentOptions,
                    value: category?.parent || ''
                }
            ],
            submitText: isEdit ? '수정' : '생성',
            onSubmit: async (data) => {
                const categoryData = {
                    name: data.name,
                    description: data.description,
                    icon: data.icon,
                    parent: data.parent || null
                };

                let result;
                if (isEdit) {
                    result = await CategoryManager.updateCategory(category._id || category.id, categoryData);
                } else {
                    result = await CategoryManager.createCategory(categoryData);
                }

                if (result.success) {
                    Modal.close();
                    // Refresh category list/tree if exists
                    if (typeof loadCategories === 'function') {
                        loadCategories();
                    }
                }
            }
        });
    },

    // Review creation/edit modal
    showReviewModal: (productId, review = null) => {
        const isEdit = !!review;

        Modal.showForm({
            title: isEdit ? '리뷰 수정' : '리뷰 작성',
            fields: [
                {
                    name: 'rating',
                    label: '평점',
                    type: 'select',
                    required: true,
                    options: [
                        {value: '5', label: '⭐⭐⭐⭐⭐ (5점) - 최고예요!'},
                        {value: '4', label: '⭐⭐⭐⭐ (4점) - 좋아요'},
                        {value: '3', label: '⭐⭐⭐ (3점) - 보통이에요'},
                        {value: '2', label: '⭐⭐ (2점) - 별로예요'},
                        {value: '1', label: '⭐ (1점) - 최악이에요'}
                    ],
                    value: review?.rating?.toString() || '5'
                },
                {
                    name: 'title',
                    label: '리뷰 제목',
                    type: 'text',
                    placeholder: '예: 정말 만족스러워요!',
                    value: review?.title || ''
                },
                {
                    name: 'comment',
                    label: '리뷰 내용',
                    type: 'textarea',
                    placeholder: '상품에 대한 솔직한 리뷰를 작성해주세요 (최소 10자)',
                    required: true,
                    value: review?.comment || ''
                }
            ],
            submitText: isEdit ? '수정' : '등록',
            onSubmit: async (data) => {
                const reviewData = {
                    product: productId,
                    rating: parseInt(data.rating),
                    title: data.title,
                    comment: data.comment
                };

                let result;
                if (isEdit) {
                    result = await ReviewManager.updateReview(review._id || review.id, reviewData);
                } else {
                    result = await ReviewManager.createReview(reviewData);
                }

                if (result.success) {
                    Modal.close();
                    // Refresh reviews if exists
                    if (typeof loadReviews === 'function') {
                        loadReviews();
                    }
                }
            }
        });
    },

    // Product details modal
    showProductModal: (product) => {
        const content = `
            <div class="space-y-6">
                <!-- Images -->
                ${product.images && product.images.length > 0 ? `
                    <div class="grid grid-cols-2 gap-4">
                        ${product.images.slice(0, 4).map(img => `
                            <div class="image-zoom cursor-pointer rounded-lg overflow-hidden">
                                <img src="${img}" alt="${product.name}" 
                                     onclick="Modal.showImage('${img}')"
                                     class="w-full h-48 object-cover">
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                <!-- Info -->
                <div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${product.name}</h3>
                    <p class="text-lg text-gray-600 mb-4">${product.koreanName || ''}</p>
                    
                    ${product.scientificName ? `
                        <p class="text-sm italic text-gray-500 mb-4">${product.scientificName}</p>
                    ` : ''}

                    <div class="flex items-center space-x-4 mb-6">
                        <span class="text-3xl font-bold text-green-600">₩${product.price?.toLocaleString()}</span>
                        ${product.priceUSD ? `
                            <span class="text-lg text-gray-500">$${product.priceUSD}</span>
                        ` : ''}
                    </div>

                    <p class="text-gray-700 leading-relaxed mb-6">${product.description}</p>

                    <!-- Details Grid -->
                    <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                            <span class="text-sm text-gray-600">재고</span>
                            <p class="font-semibold">${product.stockQuantity}개</p>
                        </div>
                        ${product.difficultyLevel ? `
                            <div>
                                <span class="text-sm text-gray-600">난이도</span>
                                <p class="font-semibold">${product.difficultyLevel}</p>
                            </div>
                        ` : ''}
                        ${product.careLevel ? `
                            <div>
                                <span class="text-sm text-gray-600">관리 수준</span>
                                <p class="font-semibold">${product.careLevel}</p>
                            </div>
                        ` : ''}
                        ${product.lightRequirement ? `
                            <div>
                                <span class="text-sm text-gray-600">광량</span>
                                <p class="font-semibold">${product.lightRequirement}</p>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Actions -->
                    <div class="flex space-x-4 mt-6">
                        <button onclick="addToCart('${product._id || product.id}')" 
                                class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">
                            <i class="fas fa-shopping-cart mr-2"></i>장바구니 담기
                        </button>
                        <button onclick="Modal.close()" 
                                class="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            닫기
                        </button>
                    </div>
                </div>
            </div>
        `;

        Modal.show({
            title: '상품 상세정보',
            content: content,
            size: 'large'
        });
    },

    // Product creation/edit modal
    showProductModal: async (product = null) => {
        const isEdit = !!product;
        
        // Get shops and categories for dropdowns
        const shops = await DataSource.getShops();
        const categories = await DataSource.getCategories();
        
        const shopOptions = shops.map(shop => ({
            value: shop.id,
            label: shop.name
        }));
        
        const categoryOptions = categories.map(cat => ({
            value: cat.id,
            label: cat.name
        }));

        Modal.showForm({
            title: isEdit ? '상품 수정' : '새 상품 추가',
            fields: [
                {
                    name: 'korean_name',
                    label: '한국어 상품명',
                    type: 'text',
                    placeholder: '예: 몬스테라 델리시오사',
                    required: true,
                    value: product?.korean_name || ''
                },
                {
                    name: 'name',
                    label: '영어 상품명',
                    type: 'text',
                    placeholder: '예: Monstera Deliciosa',
                    required: true,
                    value: product?.name || ''
                },
                {
                    name: 'scientific_name',
                    label: '학명',
                    type: 'text',
                    placeholder: '예: Monstera deliciosa Liebm.',
                    value: product?.scientific_name || ''
                },
                {
                    name: 'description',
                    label: '상품 설명',
                    type: 'textarea',
                    placeholder: '상품에 대한 자세한 설명을 입력하세요',
                    required: true,
                    value: product?.description || ''
                },
                {
                    name: 'price',
                    label: '가격 (THB)',
                    type: 'number',
                    placeholder: '1000',
                    required: true,
                    value: product?.price || ''
                },
                {
                    name: 'price_usd',
                    label: '가격 (USD)',
                    type: 'number',
                    placeholder: '30',
                    value: product?.price_usd || ''
                },
                {
                    name: 'stock_quantity',
                    label: '재고 수량',
                    type: 'number',
                    placeholder: '10',
                    required: true,
                    value: product?.stock_quantity || ''
                },
                {
                    name: 'shop_id',
                    label: '샵',
                    type: 'select',
                    options: shopOptions,
                    required: true,
                    value: product?.shop_id || ''
                },
                {
                    name: 'category_id',
                    label: '카테고리',
                    type: 'select',
                    options: categoryOptions,
                    required: true,
                    value: product?.category_id || ''
                },
                {
                    name: 'difficulty_level',
                    label: '재배 난이도',
                    type: 'select',
                    options: [
                        {value: 'easy', label: '쉬움'},
                        {value: 'medium', label: '보통'},
                        {value: 'hard', label: '어려움'}
                    ],
                    value: product?.difficulty_level || 'medium'
                },
                {
                    name: 'is_featured',
                    label: '추천 상품',
                    type: 'checkbox',
                    value: product?.is_featured || false
                },
                {
                    name: 'is_rare',
                    label: '희귀 상품',
                    type: 'checkbox',
                    value: product?.is_rare || false
                },
                {
                    name: 'is_active',
                    label: '활성 상태',
                    type: 'checkbox',
                    value: product?.is_active !== false
                },
                {
                    name: 'images',
                    label: '상품 이미지',
                    type: 'image-selector',
                    value: product?.images || []
                }
            ],
            submitText: isEdit ? '수정' : '추가',
            onSubmit: async (data) => {
                // Parse images from JSON string
                let images = [];
                try {
                    images = JSON.parse(data.images) || [];
                } catch (e) {
                    images = product?.images || [];
                }

                const productData = {
                    korean_name: data.korean_name,
                    name: data.name,
                    scientific_name: data.scientific_name,
                    description: data.description,
                    price: parseFloat(data.price),
                    price_usd: data.price_usd ? parseFloat(data.price_usd) : null,
                    stock_quantity: parseInt(data.stock_quantity),
                    shop: data.shop_id,
                    category: data.category_id,
                    difficulty_level: data.difficulty_level,
                    is_featured: data.is_featured || false,
                    is_rare: data.is_rare || false,
                    is_active: data.is_active !== false,
                    images: images
                };

                try {
                    if (DataSource.mode === 'api' && API.token) {
                        // API mode
                        let result;
                        if (isEdit) {
                            result = await API.products.update(product._id || product.id, productData);
                        } else {
                            result = await API.products.create(productData);
                        }

                        if (result.success) {
                            Modal.close();
                            Utils.showToast(`상품이 ${isEdit ? '수정' : '추가'}되었습니다.`, 'success');
                            
                            // Refresh product list
                            if (typeof loadAdminProducts === 'function') {
                                loadAdminProducts();
                            }
                            if (typeof loadDashboardStats === 'function') {
                                loadDashboardStats();
                            }
                        }
                    } else {
                        // LocalStorage mode
                        let products = Storage.get('products') || [];
                        
                        if (isEdit) {
                            const index = products.findIndex(p => p.id === (product._id || product.id));
                            if (index !== -1) {
                                products[index] = {
                                    ...products[index],
                                    ...productData,
                                    id: product._id || product.id,
                                    updated_at: new Date().toISOString()
                                };
                            }
                        } else {
                            const newProduct = {
                                id: Utils.generateId(),
                                ...productData,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            };
                            products.push(newProduct);
                        }
                        
                        Storage.set('products', products);
                        Modal.close();
                        Utils.showToast(`상품이 ${isEdit ? '수정' : '추가'}되었습니다.`, 'success');
                        
                        // Refresh product list
                        if (typeof loadAdminProducts === 'function') {
                            loadAdminProducts();
                        }
                        if (typeof loadDashboardStats === 'function') {
                            loadDashboardStats();
                        }
                    }
                } catch (error) {
                    console.error('Product save error:', error);
                    Utils.showToast('상품 저장에 실패했습니다.', 'error');
                }
            }
        });
    },

    // Image selector modal
    openImageSelector: (fieldName) => {
        const media = Storage.get('media') || [];
        const images = media.filter(m => m.type.startsWith('image/'));
        
        if (images.length === 0) {
            Utils.showToast('업로드된 이미지가 없습니다. 먼저 미디어를 업로드해주세요.', 'info');
            return;
        }

        const content = `
            <div class="space-y-4">
                <div class="text-center">
                    <h3 class="text-lg font-semibold mb-2">이미지 선택</h3>
                    <p class="text-sm text-gray-600">상품에 추가할 이미지를 선택하세요</p>
                </div>
                <div class="grid grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    ${images.map(img => `
                        <div class="relative group cursor-pointer border-2 border-transparent hover:border-green-500 rounded-lg overflow-hidden" 
                             onclick="ModalTemplates.selectImage('${fieldName}', '${img.url}')">
                            <img src="${img.url}" alt="${img.name}" class="w-full h-20 object-cover">
                            <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex items-center justify-center">
                                <i class="fas fa-plus text-white text-xl opacity-0 group-hover:opacity-100 transition"></i>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex justify-end space-x-2">
                    <button onclick="Modal.close()" 
                            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                        취소
                    </button>
                </div>
            </div>
        `;

        Modal.show({
            title: '이미지 선택',
            content: content,
            size: 'large'
        });
    },

    // Select image for product
    selectImage: (fieldName, imageUrl) => {
        const hiddenInput = document.getElementById(fieldName);
        const previewContainer = document.getElementById(`${fieldName}-preview`);
        
        if (!hiddenInput || !previewContainer) return;

        // Get current images
        let currentImages = [];
        try {
            currentImages = JSON.parse(hiddenInput.value) || [];
        } catch (e) {
            currentImages = [];
        }

        // Add new image if not already exists
        if (!currentImages.includes(imageUrl)) {
            currentImages.push(imageUrl);
            
            // Update hidden input
            hiddenInput.value = JSON.stringify(currentImages);
            
            // Update preview
            ModalTemplates.updateImagePreview(fieldName, currentImages);
            
            Utils.showToast('이미지가 추가되었습니다.', 'success');
        } else {
            Utils.showToast('이미 이미 선택된 이미지입니다.', 'info');
        }
    },

    // Remove image from product
    removeImage: (fieldName, index) => {
        const hiddenInput = document.getElementById(fieldName);
        const previewContainer = document.getElementById(`${fieldName}-preview`);
        
        if (!hiddenInput || !previewContainer) return;

        // Get current images
        let currentImages = [];
        try {
            currentImages = JSON.parse(hiddenInput.value) || [];
        } catch (e) {
            currentImages = [];
        }

        // Remove image at index
        currentImages.splice(index, 1);
        
        // Update hidden input
        hiddenInput.value = JSON.stringify(currentImages);
        
        // Update preview
        ModalTemplates.updateImagePreview(fieldName, currentImages);
        
        Utils.showToast('이미지가 제거되었습니다.', 'success');
    },

    // Update image preview
    updateImagePreview: (fieldName, images) => {
        const previewContainer = document.getElementById(`${fieldName}-preview`);
        if (!previewContainer) return;

        previewContainer.innerHTML = images.map((img, index) => `
            <div class="relative group">
                <img src="${img}" alt="상품 이미지 ${index + 1}" class="w-full h-20 object-cover rounded">
                <button type="button" onclick="ModalTemplates.removeImage('${fieldName}', ${index})" 
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    },

    // Order details modal
    showOrderModal: (order) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            confirmed: 'bg-blue-100 text-blue-800',
            processing: 'bg-purple-100 text-purple-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const content = `
            <div class="space-y-6">
                <!-- Order Header -->
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-xl font-bold text-gray-800">주문번호: ${order.orderNumber}</h3>
                        <p class="text-sm text-gray-600">${new Date(order.createdAt).toLocaleString('ko-KR')}</p>
                    </div>
                    <span class="px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.orderStatus]}">
                        ${order.orderStatus}
                    </span>
                </div>

                <!-- Items -->
                <div class="border-t border-b py-4">
                    <h4 class="font-semibold mb-3">주문 상품</h4>
                    <div class="space-y-3">
                        ${order.items.map(item => `
                            <div class="flex items-center space-x-4">
                                ${item.product?.images?.[0] ? `
                                    <img src="${item.product.images[0]}" 
                                         alt="${item.product.name}"
                                         class="w-16 h-16 object-cover rounded">
                                ` : ''}
                                <div class="flex-1">
                                    <p class="font-medium">${item.product?.name || '상품'}</p>
                                    <p class="text-sm text-gray-600">
                                        ₩${item.price?.toLocaleString()} × ${item.quantity}개
                                    </p>
                                </div>
                                <p class="font-semibold">₩${(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Shipping Address -->
                <div>
                    <h4 class="font-semibold mb-2">배송지 정보</h4>
                    <p class="text-gray-700">
                        ${order.shippingAddress?.street}<br>
                        ${order.shippingAddress?.city}, ${order.shippingAddress?.country}
                    </p>
                </div>

                <!-- Pricing -->
                <div class="space-y-2 pt-4 border-t">
                    <div class="flex justify-between">
                        <span class="text-gray-600">상품 금액</span>
                        <span>₩${order.pricing?.subtotal?.toLocaleString()}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">배송비</span>
                        <span>₩${order.pricing?.shippingFee?.toLocaleString()}</span>
                    </div>
                    ${order.pricing?.tax ? `
                        <div class="flex justify-between">
                            <span class="text-gray-600">세금</span>
                            <span>₩${order.pricing.tax.toLocaleString()}</span>
                        </div>
                    ` : ''}
                    <div class="flex justify-between text-lg font-bold pt-2 border-t">
                        <span>총 결제 금액</span>
                        <span class="text-green-600">₩${order.pricing?.total?.toLocaleString()}</span>
                    </div>
                </div>

                <!-- Actions -->
                ${Auth.hasAnyRole(['shop_owner', 'admin']) ? `
                    <div class="flex space-x-4">
                        <button onclick="updateOrderStatus('${order._id || order.id}')" 
                                class="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                            상태 변경
                        </button>
                        <button onclick="Modal.close()" 
                                class="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                            닫기
                        </button>
                    </div>
                ` : `
                    <button onclick="Modal.close()" 
                            class="w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        닫기
                    </button>
                `}
            </div>
        `;

        Modal.show({
            title: '주문 상세정보',
            content: content,
            size: 'large'
        });
    }
};

// Export ModalTemplates
window.ModalTemplates = ModalTemplates;

console.log('✅ Modal Templates loaded');
