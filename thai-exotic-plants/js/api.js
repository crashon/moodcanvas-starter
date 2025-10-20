// API Client for Thai Exotic Plants
// Handles all communication with backend API

const API = {
    baseURL: 'http://localhost:5000/api/v1',
    token: null,

    // Initialize API client
    init: () => {
        // Load token from localStorage
        API.token = localStorage.getItem('token');
    },

    // Set authentication token
    setToken: (token) => {
        API.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    // Get headers with authentication
    getHeaders: () => {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (API.token) {
            headers['Authorization'] = `Bearer ${API.token}`;
        }

        return headers;
    },

    // Generic request handler
    request: async (endpoint, options = {}) => {
        try {
            const url = `${API.baseURL}${endpoint}`;
            const config = {
                ...options,
                headers: {
                    ...API.getHeaders(),
                    ...options.headers
                }
            };

            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API 요청 실패');
            }

            return data;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    },

    // Authentication endpoints
    auth: {
        register: async (userData) => {
            const data = await API.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (data.token) {
                API.setToken(data.token);
            }
            
            return data;
        },

        login: async (email, password) => {
            const data = await API.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            if (data.token) {
                API.setToken(data.token);
            }
            
            return data;
        },

        logout: async () => {
            try {
                await API.request('/auth/logout');
            } finally {
                API.setToken(null);
            }
        },

        getMe: async () => {
            return await API.request('/auth/me');
        },

        updateDetails: async (details) => {
            return await API.request('/auth/updatedetails', {
                method: 'PUT',
                body: JSON.stringify(details)
            });
        },

        updatePassword: async (currentPassword, newPassword) => {
            return await API.request('/auth/updatepassword', {
                method: 'PUT',
                body: JSON.stringify({ currentPassword, newPassword })
            });
        }
    },

    // Products endpoints
    products: {
        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return await API.request(`/products?${queryString}`);
        },

        getById: async (id) => {
            return await API.request(`/products/${id}`);
        },

        create: async (productData) => {
            return await API.request('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            });
        },

        update: async (id, productData) => {
            return await API.request(`/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(productData)
            });
        },

        delete: async (id) => {
            return await API.request(`/products/${id}`, {
                method: 'DELETE'
            });
        },

        getFeatured: async () => {
            return await API.request('/products/featured');
        },

        getByShop: async (shopId) => {
            return await API.request(`/products/shop/${shopId}`);
        },

        search: async (query) => {
            return await API.request(`/products?search=${encodeURIComponent(query)}`);
        }
    },

    // Orders endpoints
    orders: {
        create: async (orderData) => {
            return await API.request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            });
        },

        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return await API.request(`/orders?${queryString}`);
        },

        getById: async (id) => {
            return await API.request(`/orders/${id}`);
        },

        getMy: async () => {
            return await API.request('/orders/my');
        },

        updateStatus: async (id, status, note) => {
            return await API.request(`/orders/${id}/status`, {
                method: 'PUT',
                body: JSON.stringify({ status, note })
            });
        },

        cancel: async (id, reason) => {
            return await API.request(`/orders/${id}/cancel`, {
                method: 'PUT',
                body: JSON.stringify({ reason })
            });
        },

        getByShop: async (shopId) => {
            return await API.request(`/orders/shop/${shopId}`);
        }
    },

    // Media endpoints
    media: {
        upload: async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch(`${API.baseURL}/media/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API.token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            return await response.json();
        },

        uploadMultiple: async (files) => {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('files', file);
            });
            
            const response = await fetch(`${API.baseURL}/media/upload-multiple`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API.token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Upload failed');
            }
            
            return await response.json();
        },

        getAll: async () => {
            return await API.request('/media');
        },

        delete: async (filename) => {
            return await API.request(`/media/${filename}`, {
                method: 'DELETE'
            });
        }
    },

    // Shops endpoints
    shops: {
        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return await API.request(`/shops?${queryString}`);
        },

        getById: async (id) => {
            return await API.request(`/shops/${id}`);
        },

        create: async (shopData) => {
            return await API.request('/shops', {
                method: 'POST',
                body: JSON.stringify(shopData)
            });
        },

        update: async (id, shopData) => {
            return await API.request(`/shops/${id}`, {
                method: 'PUT',
                body: JSON.stringify(shopData)
            });
        },

        delete: async (id) => {
            return await API.request(`/shops/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Categories endpoints
    categories: {
        getAll: async (params = {}) => {
            const queryString = new URLSearchParams(params).toString();
            return await API.request(`/categories?${queryString}`);
        },

        getById: async (id) => {
            return await API.request(`/categories/${id}`);
        },

        getTree: async () => {
            return await API.request('/categories/tree');
        },

        create: async (categoryData) => {
            return await API.request('/categories', {
                method: 'POST',
                body: JSON.stringify(categoryData)
            });
        },

        update: async (id, categoryData) => {
            return await API.request(`/categories/${id}`, {
                method: 'PUT',
                body: JSON.stringify(categoryData)
            });
        },

        delete: async (id) => {
            return await API.request(`/categories/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // Helper methods for migration from localStorage to API
    migrate: {
        // Check if using localStorage or API
        isUsingLocalStorage: () => {
            return !API.token && Storage.get('products');
        },

        // Migrate data from localStorage to API
        migrateToAPI: async () => {
            if (!API.token) {
                console.warn('No authentication token. Please login first.');
                return false;
            }

            try {
                // Get data from localStorage
                const products = Storage.get('products') || [];
                const shops = Storage.get('shops') || [];
                const categories = Storage.get('categories') || [];

                // Upload to API
                // This is a simplified version - in production, you'd want more error handling
                console.log('Migration would upload:', {
                    products: products.length,
                    shops: shops.length,
                    categories: categories.length
                });

                return true;
            } catch (error) {
                console.error('Migration error:', error);
                return false;
            }
        }
    }
};

// Initialize on load
API.init();

// Export API object
window.API = API;

// Helper function to switch between localStorage and API modes
window.DataSource = {
    mode: API.token ? 'api' : 'localStorage',

    // Get products from either source
    getProducts: async (filters = {}) => {
        if (DataSource.mode === 'api' && API.token) {
            try {
                const response = await API.products.getAll(filters);
                return response.data;
            } catch (error) {
                console.error('API products error, falling back to localStorage:', error);
                // Fallback to localStorage on API error
                return DataSource.getProductsFromLocalStorage(filters);
            }
        } else {
            // Fallback to localStorage
            return DataSource.getProductsFromLocalStorage(filters);
        }
    },

    // Get products from localStorage
    getProductsFromLocalStorage: (filters = {}) => {
        let products = Storage.get('products') || [];
        
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
                p.korean_name.toLowerCase().includes(searchLower)
            );
        }

        return products;
    },

    // Create order in either source
    createOrder: async (orderData) => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.orders.create(orderData);
            return response.data;
        } else {
            // Fallback to localStorage
            const orders = Storage.get('orders') || [];
            const order = {
                id: Utils.generateId(),
                orderNumber: 'ORD-' + Date.now(),
                ...orderData,
                created_at: new Date().toISOString()
            };
            orders.push(order);
            Storage.set('orders', orders);
            return order;
        }
    },

    // Get shops from either source
    getShops: async (filters = {}) => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.shops.getAll(filters);
            return response.data;
        } else {
            // Fallback to localStorage
            let shops = Storage.get('shops') || [];
            
            // Apply filters
            if (filters.is_active !== undefined) {
                shops = shops.filter(s => s.is_active === filters.is_active);
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                shops = shops.filter(s => 
                    s.name.toLowerCase().includes(searchLower) ||
                    (s.description && s.description.toLowerCase().includes(searchLower))
                );
            }

            return shops;
        }
    },

    // Get categories from either source
    getCategories: async (filters = {}) => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.categories.getAll(filters);
            return response.data;
        } else {
            // Fallback to localStorage
            let categories = Storage.get('categories') || [];
            
            // Apply filters
            if (filters.is_active !== undefined) {
                categories = categories.filter(c => c.is_active === filters.is_active);
            }
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                categories = categories.filter(c => 
                    c.name.toLowerCase().includes(searchLower) ||
                    (c.name_en && c.name_en.toLowerCase().includes(searchLower))
                );
            }

            return categories;
        }
    },

    // Get category tree from either source
    getCategoryTree: async () => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.categories.getTree();
            return response.data;
        } else {
            // Fallback to localStorage - build tree from flat structure
            const categories = Storage.get('categories') || [];
            return CategoryManager.buildTreeFromFlat(categories);
        }
    },

    // Create category in either source
    createCategory: async (categoryData) => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.categories.create(categoryData);
            return response.data;
        } else {
            // Fallback to localStorage
            const categories = Storage.get('categories') || [];
            const category = {
                id: Utils.generateId(),
                ...categoryData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            categories.push(category);
            Storage.set('categories', categories);
            return category;
        }
    },

    // Update category in either source
    updateCategory: async (categoryId, categoryData) => {
        if (DataSource.mode === 'api' && API.token) {
            const response = await API.categories.update(categoryId, categoryData);
            return response.data;
        } else {
            // Fallback to localStorage
            const categories = Storage.get('categories') || [];
            const index = categories.findIndex(c => c.id === categoryId);
            if (index !== -1) {
                categories[index] = {
                    ...categories[index],
                    ...categoryData,
                    updated_at: new Date().toISOString()
                };
                Storage.set('categories', categories);
                return categories[index];
            }
            return null;
        }
    },

    // Delete category in either source
    deleteCategory: async (categoryId) => {
        if (DataSource.mode === 'api' && API.token) {
            await API.categories.delete(categoryId);
            return true;
        } else {
            // Fallback to localStorage
            const categories = Storage.get('categories') || [];
            const filtered = categories.filter(c => c.id !== categoryId);
            Storage.set('categories', filtered);
            return true;
        }
    },

    // Switch mode
    switchMode: (newMode) => {
        if (newMode === 'api' && !API.token) {
            console.warn('Cannot switch to API mode without authentication');
            return false;
        }
        DataSource.mode = newMode;
        console.log(`Switched to ${newMode} mode`);
        return true;
    }
};

// Show API status in console
console.log(`
╔═══════════════════════════════════════════════════════╗
║  🌿 Thai Exotic Plants API Client                    ║
║                                                       ║
║  Mode: ${DataSource.mode.toUpperCase().padEnd(44)}║
║  Backend: ${API.baseURL.padEnd(41)}║
║  Status: ${(API.token ? '✅ Authenticated' : '❌ Not authenticated').padEnd(43)}║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
