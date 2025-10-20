// Products Management for Thai Exotic Plants

// Product display and filtering
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilters();
});

// Load and display products
function loadProducts(filters = {}) {
    const productsGrid = document.getElementById('products-grid');
    const productsLoading = document.getElementById('products-loading');
    
    if (!productsGrid) return;

    // Show loading
    if (productsLoading) {
        productsLoading.classList.remove('hidden');
    }
    productsGrid.innerHTML = '';

    // Get products from storage
    let products = Storage.get('products') || [];
    const shops = Storage.get('shops') || [];
    const categories = Storage.get('categories') || [];

    // Apply filters
    if (filters.category) {
        products = products.filter(p => p.category_id === filters.category);
    }
    if (filters.shop) {
        products = products.filter(p => p.shop_id === filters.shop);
    }
    if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p => 
            p.name.toLowerCase().includes(searchLower) ||
            p.korean_name.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
    }

    // Apply sorting
    switch (filters.sort) {
        case 'price-low':
            products.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            products.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            products.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'newest':
        default:
            products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }

    // Hide loading
    setTimeout(() => {
        if (productsLoading) {
            productsLoading.classList.add('hidden');
        }

        // Display products
        if (products.length === 0) {
            productsGrid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-search text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">상품을 찾을 수 없습니다.</p>
                </div>
            `;
            return;
        }

        productsGrid.innerHTML = products
            .filter(p => p.is_active)
            .map(product => {
                const shop = shops.find(s => s.id === product.shop_id);
                const category = categories.find(c => c.id === product.category_id);
                
                return `
                    <div class="product-card card cursor-pointer" data-product-id="${product.id}">
                        <div class="image-zoom relative">
                            <img src="${product.images[0] || 'https://via.placeholder.com/400'}" 
                                 alt="${product.korean_name}"
                                 class="w-full h-64 object-cover">
                            ${product.is_rare ? '<span class="badge-rare absolute top-2 left-2">희귀</span>' : ''}
                            ${product.is_featured ? '<span class="badge-featured absolute top-2 right-2">추천</span>' : ''}
                        </div>
                        <div class="p-4">
                            <div class="text-sm text-gray-500 mb-1">
                                <i class="fas fa-store mr-1"></i>${shop ? shop.name : '알 수 없음'}
                            </div>
                            <h3 class="text-lg font-bold mb-1">${product.korean_name}</h3>
                            <p class="text-sm text-gray-600 mb-2">${product.name}</p>
                            <p class="text-xs text-gray-500 mb-3">${category ? category.name : ''}</p>
                            <div class="flex items-center justify-between mb-3">
                                <span class="price">${Utils.formatCurrency(product.price)}</span>
                                <span class="text-sm ${getDifficultyColor(product.difficulty_level)}">
                                    <i class="fas fa-signal mr-1"></i>${getDifficultyText(product.difficulty_level)}
                                </span>
                            </div>
                            <div class="flex items-center justify-between text-sm text-gray-500 mb-3">
                                <span><i class="fas fa-box mr-1"></i>재고: ${product.stock_quantity}</span>
                            </div>
                            <button class="add-to-cart-btn w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                                    data-product-id="${product.id}">
                                <i class="fas fa-shopping-cart mr-2"></i>장바구니 담기
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

        // Add click events
        attachProductEvents();
    }, 500);
}

// Setup filters
function setupFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');

    // Populate category filter
    if (categoryFilter) {
        const categories = Storage.get('categories') || [];
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });

        // Add change event
        categoryFilter.addEventListener('change', applyFilters);
    }

    if (sortFilter) {
        sortFilter.addEventListener('change', applyFilters);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', applyFilters);
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
}

// Apply all filters
function applyFilters() {
    const filters = {
        category: document.getElementById('category-filter')?.value || '',
        sort: document.getElementById('sort-filter')?.value || 'newest',
        search: document.getElementById('search-input')?.value || ''
    };

    loadProducts(filters);
}

// Filter products by category (called from main.js)
window.filterProductsByCategory = (categoryId) => {
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.value = categoryId;
        applyFilters();
    }
};

// Filter products by shop (called from main.js)
window.filterProductsByShop = (shopId) => {
    loadProducts({ shop: shopId });
};

// Attach events to product cards
function attachProductEvents() {
    // Product card click to show detail
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = card.dataset.productId;
                showProductDetail(productId);
            }
        });
    });

    // Add to cart button click
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productId = btn.dataset.productId;
            if (window.Cart) {
                window.Cart.addItem(productId);
            }
        });
    });
}

// Show product detail modal
function showProductDetail(productId) {
    const modal = document.getElementById('product-modal');
    const detailContainer = document.getElementById('product-detail');
    
    if (!modal || !detailContainer) return;

    const products = Storage.get('products') || [];
    const shops = Storage.get('shops') || [];
    const categories = Storage.get('categories') || [];
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    const shop = shops.find(s => s.id === product.shop_id);
    const category = categories.find(c => c.id === product.category_id);

    detailContainer.innerHTML = `
        <button id="close-product-modal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
        </button>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <div class="mb-4">
                    <img src="${product.images[0] || 'https://via.placeholder.com/600'}" 
                         alt="${product.korean_name}"
                         class="w-full rounded-lg">
                </div>
                ${product.images.length > 1 ? `
                    <div class="grid grid-cols-4 gap-2">
                        ${product.images.slice(1).map(img => `
                            <img src="${img}" class="w-full h-20 object-cover rounded cursor-pointer hover:opacity-75">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div>
                <div class="mb-4">
                    ${product.is_rare ? '<span class="badge-rare mr-2">희귀</span>' : ''}
                    ${product.is_featured ? '<span class="badge-featured">추천</span>' : ''}
                </div>
                <h2 class="text-3xl font-bold mb-2">${product.korean_name}</h2>
                <p class="text-lg text-gray-600 mb-2">${product.name}</p>
                <p class="text-sm text-gray-500 italic mb-4">${product.scientific_name}</p>
                
                <div class="border-t border-b py-4 mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600">샵:</span>
                        <span class="font-semibold">${shop ? shop.name : '알 수 없음'}</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600">카테고리:</span>
                        <span class="font-semibold">${category ? category.name : '알 수 없음'}</span>
                    </div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-gray-600">재배 난이도:</span>
                        <span class="font-semibold ${getDifficultyColor(product.difficulty_level)}">
                            ${getDifficultyText(product.difficulty_level)}
                        </span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-gray-600">재고:</span>
                        <span class="font-semibold">${product.stock_quantity}개</span>
                    </div>
                </div>

                <p class="text-gray-700 mb-6">${product.description}</p>

                <div class="mb-6">
                    <div class="text-3xl font-bold text-green-600">${Utils.formatCurrency(product.price)}</div>
                    <div class="text-sm text-gray-500">${Utils.formatCurrency(product.price_usd, 'USD')}</div>
                </div>

                <div class="flex space-x-4">
                    <button class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold"
                            onclick="window.Cart && window.Cart.addItem('${product.id}')">
                        <i class="fas fa-shopping-cart mr-2"></i>장바구니 담기
                    </button>
                    <button class="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    // Close modal event
    document.getElementById('close-product-modal').addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

// Get difficulty level text
function getDifficultyText(level) {
    const levels = {
        'easy': '쉬움',
        'medium': '보통',
        'hard': '어려움'
    };
    return levels[level] || '보통';
}

// Get difficulty level color class
function getDifficultyColor(level) {
    const colors = {
        'easy': 'difficulty-easy',
        'medium': 'difficulty-medium',
        'hard': 'difficulty-hard'
    };
    return colors[level] || 'difficulty-medium';
}
