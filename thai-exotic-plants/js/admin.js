// Admin Dashboard for Thai Exotic Plants

document.addEventListener('DOMContentLoaded', () => {
    initAdminDashboard();
    setupNavigation();
    loadDashboardStats();
});

// Initialize admin dashboard
function initAdminDashboard() {
    // Show dashboard section by default
    showSection('dashboard');
}

// Setup navigation
function setupNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('href').substring(1);
            
            // Update active state
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Show section
            showSection(section);
        });
    });
}

// Show section
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    
    // Show selected section
    const section = document.getElementById(`${sectionName}-section`);
    if (section) {
        section.classList.remove('hidden');
        
        // Load section data
        switch (sectionName) {
            case 'dashboard':
                loadDashboardStats();
                break;
            case 'products':
                loadAdminProducts();
                break;
            case 'shops':
                loadAdminShops();
                break;
            case 'orders':
                loadAdminOrders();
                break;
            case 'categories':
                loadAdminCategories();
                break;
            case 'social':
                loadSocialPosts();
                break;
            case 'media':
                loadMediaLibrary();
                break;
        }
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    const products = Storage.get('products') || [];
    const orders = Storage.get('orders') || [];
    const shops = Storage.get('shops') || [];
    
    // Calculate stats
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
    const totalProducts = products.filter(p => p.is_active).length;
    const totalOrders = orders.length;
    const totalShops = shops.filter(s => s.is_active).length;
    
    // Update stat cards
    document.getElementById('total-revenue').textContent = Utils.formatCurrency(totalRevenue);
    document.getElementById('total-products').textContent = totalProducts;
    document.getElementById('total-orders').textContent = totalOrders;
    document.getElementById('total-shops').textContent = totalShops;
    
    // Load charts
    loadRevenueChart();
    loadCategoryChart();
}

// Load revenue chart
function loadRevenueChart() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) return;
    
    const orders = Storage.get('orders') || [];
    
    // Calculate monthly revenue
    const monthlyRevenue = Array(12).fill(0);
    orders.forEach(order => {
        const month = new Date(order.created_at).getMonth();
        monthlyRevenue[month] += order.total_amount;
    });
    
    // Destroy existing chart if it exists
    if (window.revenueChart) {
        window.revenueChart.destroy();
    }
    
    window.revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            datasets: [{
                label: '매출 (THB)',
                data: monthlyRevenue,
                borderColor: '#166534',
                backgroundColor: 'rgba(22, 101, 52, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Load category chart
function loadCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    const products = Storage.get('products') || [];
    const categories = Storage.get('categories') || [];
    
    // Count products by category
    const categoryCounts = {};
    categories.forEach(cat => {
        categoryCounts[cat.id] = {
            name: cat.name,
            count: products.filter(p => p.category_id === cat.id).length
        };
    });
    
    // Destroy existing chart if it exists
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }
    
    window.categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.values(categoryCounts).map(c => c.name),
            datasets: [{
                data: Object.values(categoryCounts).map(c => c.count),
                backgroundColor: [
                    '#166534',
                    '#15803d',
                    '#16a34a',
                    '#22c55e'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
}

// Load admin products
async function loadAdminProducts() {
    const productsTable = document.getElementById('products-table');
    if (!productsTable) return;
    
    try {
        // Show loading state
        productsTable.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-gray-500">상품을 불러오는 중...</p>
                </td>
            </tr>
        `;

        // Load products from API or localStorage
        const products = await DataSource.getProducts();
        const shops = await DataSource.getShops();
        
        console.log('Loaded products:', products);
        console.log('Product IDs:', products.map(p => p._id || p.id));
        
        if (products.length === 0) {
            productsTable.innerHTML = `
                <tr>
                    <td colspan="7" class="px-6 py-12 text-center">
                        <i class="fas fa-box text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">등록된 상품이 없습니다.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        productsTable.innerHTML = products.map(product => {
            const shop = shops.find(s => s.id === product.shop_id);
            return `
                <tr>
                    <td class="px-6 py-4">
                        <img src="${product.images?.[0] || 'https://via.placeholder.com/50'}" 
                             alt="${product.korean_name || product.name}"
                             class="w-12 h-12 object-cover rounded">
                    </td>
                    <td class="px-6 py-4">
                        <div class="font-medium">${product.korean_name || product.name}</div>
                        <div class="text-sm text-gray-500">${product.name}</div>
                    </td>
                    <td class="px-6 py-4">
                        <div class="text-sm">${shop ? shop.name : '알 수 없음'}</div>
                    </td>
                    <td class="px-6 py-4">${Utils.formatCurrency(product.price)}</td>
                    <td class="px-6 py-4">
                        <span class="${product.stock_quantity < (CONFIG?.lowStockThreshold || 5) ? 'text-red-600 font-bold' : ''}">
                            ${product.stock_quantity || 0}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="${product.is_active ? 'status-active' : 'status-inactive'}">
                            ${product.is_active ? '활성' : '비활성'}
                        </span>
                    </td>
                    <td class="px-6 py-4">
                        <button onclick="editProduct('${product._id || product.id}')" 
                                class="text-blue-600 hover:text-blue-800 mr-3">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteProduct('${product._id || product.id}')" 
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        // Add product button
        const addBtn = document.getElementById('add-product-btn');
        if (addBtn) {
            addBtn.onclick = () => showProductForm();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        productsTable.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-12 text-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                    <p class="text-red-500">상품을 불러오는데 실패했습니다.</p>
                </td>
            </tr>
        `;
    }
}

// Show product form
async function showProductForm(productId = null) {
    if (productId) {
        // Load product data for editing
        await loadProductForEdit(productId);
    } else {
        // Show new product form
        await ModalTemplates.showProductModal();
    }
}

// Load product for editing
async function loadProductForEdit(productId) {
    try {
        if (DataSource.mode === 'api' && API.token) {
            const product = await API.products.getById(productId);
            if (product.success) {
                await ModalTemplates.showProductModal(product.data);
            } else {
                Utils.showToast('상품 정보를 불러올 수 없습니다.', 'error');
            }
        } else {
            // LocalStorage mode
            const products = Storage.get('products') || [];
            const product = products.find(p => p.id === productId);
            if (product) {
                await ModalTemplates.showProductModal(product);
            } else {
                Utils.showToast('상품을 찾을 수 없습니다.', 'error');
            }
        }
    } catch (error) {
        console.error('Error loading product:', error);
        Utils.showToast('상품 정보를 불러오는데 실패했습니다.', 'error');
    }
}

// Edit product
async function editProduct(productId) {
    await showProductForm(productId);
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;
    
    try {
        if (DataSource.mode === 'api' && API.token) {
            await API.products.delete(productId);
        } else {
            // LocalStorage mode
            let products = Storage.get('products') || [];
            products = products.filter(p => p.id !== productId);
            Storage.set('products', products);
        }
        
        Utils.showToast('상품이 삭제되었습니다.', 'success');
        await loadAdminProducts();
        loadDashboardStats();
    } catch (error) {
        console.error('Delete product error:', error);
        Utils.showToast('상품 삭제에 실패했습니다.', 'error');
    }
}

// Load admin orders
function loadAdminOrders() {
    const ordersTable = document.getElementById('orders-table');
    if (!ordersTable) return;
    
    const orders = Storage.get('orders') || [];
    
    ordersTable.innerHTML = orders.map(order => `
        <tr>
            <td class="px-6 py-4 font-medium">${order.order_number}</td>
            <td class="px-6 py-4">${order.customer_name}</td>
            <td class="px-6 py-4">${Utils.formatCurrency(order.total_amount)}</td>
            <td class="px-6 py-4">
                <span class="status-${order.order_status}">
                    ${getOrderStatusText(order.order_status)}
                </span>
            </td>
            <td class="px-6 py-4">${Utils.formatDate(order.created_at)}</td>
            <td class="px-6 py-4">
                <button onclick="viewOrder('${order.id}')" 
                        class="text-blue-600 hover:text-blue-800 mr-3">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="editOrder('${order.id}')" 
                        class="text-green-600 hover:text-green-800">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Get order status text
function getOrderStatusText(status) {
    const statusTexts = {
        'new': '신규',
        'processing': '처리중',
        'shipped': '배송중',
        'delivered': '배송완료',
        'cancelled': '취소됨'
    };
    return statusTexts[status] || status;
}

// View order
function viewOrder(orderId) {
    Utils.showToast('주문 상세 보기 기능은 구현 예정입니다.', 'info');
}

// Edit order
function editOrder(orderId) {
    Utils.showToast('주문 수정 기능은 구현 예정입니다.', 'info');
}

// Load admin categories
async function loadAdminCategories() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    try {
        // Show loading state
        categoriesList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="spinner mx-auto mb-4"></div>
                <p class="text-gray-500">카테고리를 불러오는 중...</p>
            </div>
        `;

        // Load categories from API or localStorage
        const categories = await DataSource.getCategories();
        
        if (categories.length === 0) {
            categoriesList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-tags text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">등록된 카테고리가 없습니다.</p>
                </div>
            `;
            return;
        }
        
        categoriesList.innerHTML = categories.map(category => `
            <div class="bg-white p-6 rounded-lg shadow">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas ${category.icon || 'fa-tag'} text-3xl text-green-600"></i>
                    <span class="${category.is_active ? 'status-active' : 'status-inactive'}">
                        ${category.is_active ? '활성' : '비활성'}
                    </span>
                </div>
                <h3 class="text-xl font-bold mb-2">${category.name}</h3>
                <p class="text-sm text-gray-600 mb-4">${category.description || '설명 없음'}</p>
                <div class="flex space-x-2">
                    <button onclick="editCategory('${category.id || category._id}')" 
                            class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
                        <i class="fas fa-edit"></i> 수정
                    </button>
                    <button onclick="deleteCategory('${category.id || category._id}')" 
                            class="px-4 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add category button
        const addBtn = document.getElementById('add-category-btn');
        if (addBtn) {
            addBtn.onclick = () => CategoryModals.showCreateCategoryModal();
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-red-500">카테고리를 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// Category management functions
function showCategoryForm(categoryId = null) {
    Utils.showToast('카테고리 폼 기능은 구현 예정입니다.', 'info');
}

function editCategory(categoryId) {
    CategoryModals.showEditCategoryModal(categoryId);
}

async function deleteCategory(categoryId) {
    if (!confirm('정말 이 카테고리를 삭제하시겠습니까?')) return;
    
    try {
        await DataSource.deleteCategory(categoryId);
        Utils.showToast('카테고리가 삭제되었습니다.', 'success');
        await loadAdminCategories();
    } catch (error) {
        console.error('Delete category error:', error);
        Utils.showToast('카테고리 삭제에 실패했습니다.', 'error');
    }
}

// Load social posts
function loadSocialPosts() {
    const postsList = document.getElementById('social-posts-list');
    if (!postsList) return;
    
    const posts = Storage.get('social_posts') || [];
    
    if (posts.length === 0) {
        postsList.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-share-alt text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">예약된 포스트가 없습니다.</p>
            </div>
        `;
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="border-b pb-4 mb-4">
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center space-x-2">
                    <i class="fab fa-${post.platform} text-xl"></i>
                    <span class="font-semibold">${post.platform}</span>
                </div>
                <span class="text-sm text-gray-500">${Utils.formatDate(post.scheduled_at)}</span>
            </div>
            <p class="text-gray-700 mb-2">${post.content}</p>
            <div class="flex space-x-2">
                <button onclick="editPost('${post.id}')" 
                        class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-edit"></i> 수정
                </button>
                <button onclick="deletePost('${post.id}')" 
                        class="text-red-600 hover:text-red-800">
                    <i class="fas fa-trash"></i> 삭제
                </button>
            </div>
        </div>
    `).join('');
    
    // Create post button
    const createBtn = document.getElementById('create-post-btn');
    if (createBtn) {
        createBtn.onclick = () => showPostForm();
    }
}

// Social media functions
function showPostForm(postId = null) {
    Utils.showToast('소셜미디어 포스트 폼 기능은 구현 예정입니다.', 'info');
}

function editPost(postId) {
    showPostForm(postId);
}

function deletePost(postId) {
    if (!confirm('정말 이 포스트를 삭제하시겠습니까?')) return;
    
    let posts = Storage.get('social_posts') || [];
    posts = posts.filter(p => p.id !== postId);
    Storage.set('social_posts', posts);
    
    Utils.showToast('포스트가 삭제되었습니다.', 'success');
    loadSocialPosts();
}

// Load media library
function loadMediaLibrary() {
    const mediaLibrary = document.getElementById('media-library');
    if (!mediaLibrary) return;
    
    const media = Storage.get('media') || [];
    
    if (media.length === 0) {
        mediaLibrary.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-image text-5xl text-gray-300 mb-4"></i>
                <p class="text-gray-500">미디어 파일이 없습니다.</p>
            </div>
        `;
        return;
    }
    
    mediaLibrary.innerHTML = media.map(item => `
        <div class="relative group">
            <img src="${item.url}" alt="${item.name}" class="w-full h-24 object-cover rounded">
            <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <button onclick="deleteMedia('${item.id}')" 
                        class="text-white hover:text-red-500">
                    <i class="fas fa-trash text-xl"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Media upload
    const mediaUpload = document.getElementById('media-upload');
    if (mediaUpload) {
        mediaUpload.onchange = handleMediaUpload;
    }
}

// Handle media upload
function handleMediaUpload(e) {
    const files = e.target.files;
    if (files.length === 0) return;
    
    Utils.showToast('미디어 업로드 기능은 구현 예정입니다.', 'info');
}

// Delete media
function deleteMedia(mediaId) {
    if (!confirm('정말 이 미디어를 삭제하시겠습니까?')) return;
    
    let media = Storage.get('media') || [];
    media = media.filter(m => m.id !== mediaId);
    Storage.set('media', media);
    
    Utils.showToast('미디어가 삭제되었습니다.', 'success');
    loadMediaLibrary();
}

// Load admin shops
async function loadAdminShops() {
    const shopsList = document.getElementById('shops-list');
    if (!shopsList) return;
    
    try {
        // Show loading state
        shopsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="spinner mx-auto mb-4"></div>
                <p class="text-gray-500">샵을 불러오는 중...</p>
            </div>
        `;

        // Load shops from API or localStorage
        const shops = await DataSource.getShops();
        
        if (shops.length === 0) {
            shopsList.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-store text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">등록된 샵이 없습니다.</p>
                </div>
            `;
            return;
        }
        
        shopsList.innerHTML = shops.map(shop => {
            const verifiedBadge = shop.verified || shop.isVerified
                ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"><i class="fas fa-check-circle"></i> 인증됨</span>'
                : '<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"><i class="fas fa-times-circle"></i> 미인증</span>';

            const featuredBadge = shop.featured || shop.isFeatured
                ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded"><i class="fas fa-star"></i> 추천</span>'
                : '';

            const statusColor = {
                active: 'green',
                inactive: 'gray',
                closed: 'red'
            }[shop.status] || 'gray';

            return `
                <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div class="h-32 bg-gradient-to-r from-green-400 to-blue-500 relative" 
                         style="background-image: url('${shop.banner || ''}'); background-size: cover; background-position: center;">
                        ${shop.banner ? '' : '<div class="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-500"></div>'}
                    </div>
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
                                    <span class="bg-${statusColor}-100 text-${statusColor}-800 text-xs px-2 py-1 rounded">${shop.status || 'active'}</span>
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
                            <button onclick="viewShop('${shop._id || shop.id}')" 
                                    class="flex-1 bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition text-sm">
                                <i class="fas fa-eye mr-1"></i>보기
                            </button>
                            <button onclick="editShop('${shop._id || shop.id}')" 
                                    class="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="toggleShopVerification('${shop._id || shop.id}', ${!(shop.verified || shop.isVerified)})" 
                                    class="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 transition text-sm">
                                <i class="fas fa-${(shop.verified || shop.isVerified) ? 'times' : 'check'}-circle"></i>
                            </button>
                            <button onclick="deleteShop('${shop._id || shop.id}')" 
                                    class="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add shop button
        const addBtn = document.getElementById('add-shop-btn');
        if (addBtn) {
            addBtn.onclick = () => showShopForm();
        }
    } catch (error) {
        console.error('Error loading shops:', error);
        shopsList.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-red-500">샵을 불러오는데 실패했습니다.</p>
            </div>
        `;
    }
}

// Show shop form
function showShopForm(shopId = null) {
    if (shopId) {
        // Load shop data for editing
        loadShopForEdit(shopId);
    } else {
        // Show new shop form
        ShopModals.showCreateShopModal();
    }
}

// Load shop for editing
async function loadShopForEdit(shopId) {
    try {
        const shop = await ShopManager.getShopById(shopId);
        if (shop) {
            ShopModals.showEditShopModal(shopId);
        } else {
            Utils.showToast('샵 정보를 불러올 수 없습니다.', 'error');
        }
    } catch (error) {
        console.error('Error loading shop:', error);
        Utils.showToast('샵 정보를 불러오는데 실패했습니다.', 'error');
    }
}

// View shop details
function viewShop(shopId) {
    Utils.showToast('샵 상세보기 기능은 구현 예정입니다.', 'info');
}

// Edit shop
function editShop(shopId) {
    showShopForm(shopId);
}

// Delete shop
async function deleteShop(shopId) {
    try {
        const result = await ShopManager.deleteShop(shopId);
        if (result.success) {
            await loadAdminShops();
            loadDashboardStats();
        }
    } catch (error) {
        console.error('Delete shop error:', error);
        Utils.showToast('샵 삭제에 실패했습니다.', 'error');
    }
}

// Toggle shop verification
async function toggleShopVerification(shopId, verified) {
    try {
        const result = await ShopManager.verifyShop(shopId, verified);
        if (result.success) {
            await loadAdminShops();
        }
    } catch (error) {
        console.error('Toggle verification error:', error);
        Utils.showToast('샵 인증 상태 변경에 실패했습니다.', 'error');
    }
}
