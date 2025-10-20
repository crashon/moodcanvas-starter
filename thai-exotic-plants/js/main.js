// Main Application Logic for Thai Exotic Plants

// Configuration
const CONFIG = {
    apiBaseUrl: 'https://api.restfultable.com',
    tablePrefix: 'thai_plants_',
    currencySymbol: 'THB',
    lowStockThreshold: 10
};

// Utility Functions
const Utils = {
    // Generate unique ID
    generateId: () => {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Format currency
    formatCurrency: (amount, currency = CONFIG.currencySymbol) => {
        return `${amount.toLocaleString()} ${currency}`;
    },

    // Format date
    formatDate: (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    // Show toast notification
    showToast: (message, type = 'info') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <div class="flex items-center space-x-3">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-xl"></i>
                <span>${message}</span>
            </div>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Show loading spinner
    showLoading: (element) => {
        element.innerHTML = `
            <div class="flex justify-center items-center py-12">
                <div class="spinner"></div>
            </div>
        `;
    },

    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Local Storage Manager
const Storage = {
    // Get item from localStorage
    get: (key) => {
        try {
            const item = localStorage.getItem(CONFIG.tablePrefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    },

    // Set item to localStorage
    set: (key, value) => {
        try {
            localStorage.setItem(CONFIG.tablePrefix + key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },

    // Remove item from localStorage
    remove: (key) => {
        try {
            localStorage.removeItem(CONFIG.tablePrefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },

    // Clear all items
    clear: () => {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CONFIG.tablePrefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
};

// Mock Database (In production, this would be replaced with actual API calls)
const MockDB = {
    // Sample categories
    categories: [
        {
            id: 'cat_1',
            name: '희귀 아로이드',
            name_en: 'Rare Aroids',
            description: '희귀한 몬스테라, 필로덴드론 등',
            icon: 'fa-leaf',
            is_active: true
        },
        {
            id: 'cat_2',
            name: '다육식물',
            name_en: 'Succulents',
            description: '선인장과 다양한 다육이',
            icon: 'fa-seedling',
            is_active: true
        },
        {
            id: 'cat_3',
            name: '관엽식물',
            name_en: 'Foliage Plants',
            description: '실내 관엽식물',
            icon: 'fa-spa',
            is_active: true
        },
        {
            id: 'cat_4',
            name: '꽃식물',
            name_en: 'Flowering Plants',
            description: '열대 꽃식물',
            icon: 'fa-flower',
            is_active: true
        }
    ],

    // Sample shops
    shops: [
        {
            id: 'shop_1',
            name: 'Tropical Paradise',
            description: '희귀 열대식물 전문',
            owner_id: 'owner_1',
            contact: '+66-123-456-789',
            address: 'Bangkok, Thailand',
            is_active: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'shop_2',
            name: 'Green Garden',
            description: '다육식물과 선인장 전문',
            owner_id: 'owner_2',
            contact: '+66-987-654-321',
            address: 'Chiang Mai, Thailand',
            is_active: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'shop_3',
            name: 'Exotic Flora',
            description: '희귀 아로이드 컬렉션',
            owner_id: 'owner_3',
            contact: '+66-555-123-456',
            address: 'Phuket, Thailand',
            is_active: true,
            created_at: new Date().toISOString()
        }
    ],

    // Sample products
    products: [
        {
            id: 'prod_1',
            shop_id: 'shop_1',
            name: 'Monstera Albo Variegata',
            korean_name: '몬스테라 알보 바리에가타',
            thai_name: 'มอนสเตอร่า อัลโบ',
            scientific_name: 'Monstera deliciosa var. borsigiana',
            description: '희귀한 흰무늬 몬스테라. 건강한 성체로 즉시 감상 가능합니다.',
            category_id: 'cat_1',
            price: 15000,
            price_usd: 450,
            stock_quantity: 5,
            images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400'],
            videos: [],
            difficulty_level: 'medium',
            is_rare: true,
            is_featured: true,
            is_active: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_2',
            shop_id: 'shop_2',
            name: 'Echeveria Black Prince',
            korean_name: '에케베리아 블랙 프린스',
            thai_name: 'เอเคเวเรีย แบล็ค พรินซ์',
            scientific_name: 'Echeveria Black Prince',
            description: '검은색 잎이 아름다운 다육식물입니다.',
            category_id: 'cat_2',
            price: 800,
            price_usd: 24,
            stock_quantity: 25,
            images: ['https://images.unsplash.com/photo-1459156212016-c812468e2115?w=400'],
            videos: [],
            difficulty_level: 'easy',
            is_rare: false,
            is_featured: false,
            is_active: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_3',
            shop_id: 'shop_3',
            name: 'Philodendron Pink Princess',
            korean_name: '필로덴드론 핑크 프린세스',
            thai_name: 'ฟิโลเดนดรอน พิงค์ พริ้นเซส',
            scientific_name: 'Philodendron erubescens',
            description: '핑크색 무늬가 매력적인 필로덴드론입니다.',
            category_id: 'cat_1',
            price: 12000,
            price_usd: 360,
            stock_quantity: 8,
            images: ['https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400'],
            videos: [],
            difficulty_level: 'medium',
            is_rare: true,
            is_featured: true,
            is_active: true,
            created_at: new Date().toISOString()
        },
        {
            id: 'prod_4',
            shop_id: 'shop_1',
            name: 'Anthurium Clarinervium',
            korean_name: '안스리움 클라리너비움',
            thai_name: 'แอนทูเรียม คลารินิร์เวียม',
            scientific_name: 'Anthurium clarinervium',
            description: '흰색 잎맥이 돋보이는 벨벳 잎 안스리움입니다.',
            category_id: 'cat_4',
            price: 8500,
            price_usd: 255,
            stock_quantity: 12,
            images: ['https://images.unsplash.com/photo-1542908251-fd87828e3f79?w=400'],
            videos: [],
            difficulty_level: 'medium',
            is_rare: true,
            is_featured: false,
            is_active: true,
            created_at: new Date().toISOString()
        }
    ],

    // Initialize data in localStorage
    init: () => {
        if (!Storage.get('categories')) {
            Storage.set('categories', MockDB.categories);
        }
        if (!Storage.get('shops')) {
            Storage.set('shops', MockDB.shops);
        }
        if (!Storage.get('products')) {
            Storage.set('products', MockDB.products);
        }
        if (!Storage.get('orders')) {
            Storage.set('orders', []);
        }
        if (!Storage.get('social_posts')) {
            Storage.set('social_posts', []);
        }
    }
};

// Initialize mock database
MockDB.init();

// Navigation handling
document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });

    // Load categories
    loadCategories();
    
    // Load shops
    loadShops();
});

// Load categories
function loadCategories() {
    const categoriesGrid = document.getElementById('categories-grid');
    if (!categoriesGrid) return;

    const categories = Storage.get('categories') || [];
    
    categoriesGrid.innerHTML = categories.map(category => `
        <div class="category-card bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <div class="text-center">
                <i class="fas ${category.icon} text-4xl text-green-600 mb-4"></i>
                <h3 class="text-xl font-bold mb-2">${category.name}</h3>
                <p class="text-gray-600 text-sm">${category.description}</p>
            </div>
        </div>
    `).join('');

    // Add click event to filter products by category
    categoriesGrid.querySelectorAll('.category-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            const category = categories[index];
            // Scroll to products section
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            // Filter products by category
            if (window.filterProductsByCategory) {
                window.filterProductsByCategory(category.id);
            }
        });
    });
}

// Load shops
function loadShops() {
    const shopsGrid = document.getElementById('shops-grid');
    if (!shopsGrid) return;

    const shops = Storage.get('shops') || [];
    
    shopsGrid.innerHTML = shops.filter(shop => shop.is_active).map(shop => `
        <div class="shop-card cursor-pointer" data-shop-id="${shop.id}">
            <div class="bg-gradient-to-br from-green-500 to-green-700 h-32"></div>
            <div class="p-6">
                <h3 class="text-xl font-bold mb-2">${shop.name}</h3>
                <p class="text-gray-600 mb-4">${shop.description}</p>
                <div class="flex items-center text-sm text-gray-500 space-y-1">
                    <div class="flex items-center">
                        <i class="fas fa-map-marker-alt mr-2"></i>
                        <span>${shop.address}</span>
                    </div>
                </div>
                <button class="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                    상품 보기
                </button>
            </div>
        </div>
    `).join('');

    // Add click event to view shop products
    shopsGrid.querySelectorAll('.shop-card').forEach(card => {
        card.addEventListener('click', () => {
            const shopId = card.dataset.shopId;
            // Scroll to products section
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
            // Filter products by shop
            if (window.filterProductsByShop) {
                window.filterProductsByShop(shopId);
            }
        });
    });
}

// Export utilities and storage for use in other files
window.Utils = Utils;
window.Storage = Storage;
window.CONFIG = CONFIG;
window.MockDB = MockDB;
