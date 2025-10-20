// Category Manager Module for Thai Exotic Plants
// Handles category CRUD operations and tree structure

const CategoryManager = {
    categories: [],
    categoryTree: [],

    // Initialize category manager
    init: async () => {
        await CategoryManager.loadCategories();
        await CategoryManager.loadCategoryTree();
    },

    // Load all categories
    loadCategories: async (filters = {}) => {
        try {
            CategoryManager.categories = await DataSource.getCategories(filters);
            console.log(`✅ Loaded ${CategoryManager.categories.length} categories`);
            return CategoryManager.categories;
        } catch (error) {
            console.error('Error loading categories:', error);
            Utils.showToast('카테고리 목록을 불러올 수 없습니다', 'error');
            return [];
        }
    },

    // Load category tree
    loadCategoryTree: async () => {
        try {
            CategoryManager.categoryTree = await DataSource.getCategoryTree();
            console.log('✅ Loaded category tree');
            return CategoryManager.categoryTree;
        } catch (error) {
            console.error('Error loading category tree:', error);
            return [];
        }
    },

    // Get category by ID
    getCategoryById: async (categoryId) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.categories.getById(categoryId);
                return response.data;
            } else {
                const category = CategoryManager.categories.find(c => c.id === categoryId);
                return category || null;
            }
        } catch (error) {
            console.error('Error getting category:', error);
            return null;
        }
    },

    // Get category by slug
    getCategoryBySlug: async (slug) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.categories.getBySlug(slug);
                return response.data;
            } else {
                const category = CategoryManager.categories.find(c => c.slug === slug);
                return category || null;
            }
        } catch (error) {
            console.error('Error getting category by slug:', error);
            return null;
        }
    },

    // Create new category
    createCategory: async (categoryData) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 카테고리를 생성할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.categories.create(categoryData);
                
                if (response.success && response.data) {
                    const newCategory = response.data;
                    CategoryManager.categories.push(newCategory);
                    await CategoryManager.loadCategoryTree(); // Reload tree
                    
                    console.log('✅ Category created:', newCategory.name);
                    Utils.showToast('카테고리가 성공적으로 생성되었습니다', 'success');
                    
                    return {
                        success: true,
                        category: newCategory
                    };
                } else {
                    throw new Error(response.message || '카테고리 생성 실패');
                }
            } else {
                // LocalStorage mode
                const newCategory = {
                    id: Utils.generateId(),
                    ...categoryData,
                    slug: Utils.slugify(categoryData.name),
                    active: true,
                    featured: false,
                    order: CategoryManager.categories.length,
                    metadata: {
                        productCount: 0,
                        viewCount: 0
                    },
                    createdAt: new Date().toISOString()
                };

                CategoryManager.categories.push(newCategory);
                Storage.set('categories', CategoryManager.categories);
                await CategoryManager.loadCategoryTree();
                
                Utils.showToast('카테고리가 성공적으로 생성되었습니다 (데모 모드)', 'success');
                
                return {
                    success: true,
                    category: newCategory
                };
            }
        } catch (error) {
            console.error('Error creating category:', error);
            Utils.showToast(error.message || '카테고리 생성에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Update category
    updateCategory: async (categoryId, categoryData) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 카테고리를 수정할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.categories.update(categoryId, categoryData);
                
                if (response.success && response.data) {
                    const updatedCategory = response.data;
                    
                    // Update in local array
                    const index = CategoryManager.categories.findIndex(c => c._id === categoryId || c.id === categoryId);
                    if (index !== -1) {
                        CategoryManager.categories[index] = updatedCategory;
                    }
                    
                    await CategoryManager.loadCategoryTree(); // Reload tree
                    
                    console.log('✅ Category updated:', updatedCategory.name);
                    Utils.showToast('카테고리가 성공적으로 수정되었습니다', 'success');
                    
                    return {
                        success: true,
                        category: updatedCategory
                    };
                } else {
                    throw new Error(response.message || '카테고리 수정 실패');
                }
            } else {
                // LocalStorage mode
                const index = CategoryManager.categories.findIndex(c => c.id === categoryId);
                
                if (index === -1) {
                    throw new Error('카테고리를 찾을 수 없습니다');
                }

                const updatedCategory = {
                    ...CategoryManager.categories[index],
                    ...categoryData,
                    updatedAt: new Date().toISOString()
                };

                CategoryManager.categories[index] = updatedCategory;
                Storage.set('categories', CategoryManager.categories);
                await CategoryManager.loadCategoryTree();
                
                Utils.showToast('카테고리가 성공적으로 수정되었습니다 (데모 모드)', 'success');
                
                return {
                    success: true,
                    category: updatedCategory
                };
            }
        } catch (error) {
            console.error('Error updating category:', error);
            Utils.showToast(error.message || '카테고리 수정에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Delete category
    deleteCategory: async (categoryId) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 카테고리를 삭제할 수 있습니다');
            }

            // Use Modal.confirm if available
            const confirmed = window.Modal 
                ? await Modal.confirm({
                    title: '카테고리 삭제',
                    message: '정말로 이 카테고리를 삭제하시겠습니까?',
                    confirmText: '삭제',
                    confirmClass: 'bg-red-600 hover:bg-red-700'
                })
                : confirm('정말로 이 카테고리를 삭제하시겠습니까?');
            
            if (!confirmed) {
                return { success: false, cancelled: true };
            }

            if (DataSource.mode === 'api') {
                const response = await API.categories.delete(categoryId);
                
                if (response.success) {
                    // Remove from local array
                    CategoryManager.categories = CategoryManager.categories.filter(c => c._id !== categoryId && c.id !== categoryId);
                    await CategoryManager.loadCategoryTree();
                    
                    console.log('✅ Category deleted');
                    Utils.showToast('카테고리가 성공적으로 삭제되었습니다', 'success');
                    
                    return { success: true };
                } else {
                    throw new Error(response.message || '카테고리 삭제 실패');
                }
            } else {
                // LocalStorage mode
                CategoryManager.categories = CategoryManager.categories.filter(c => c.id !== categoryId);
                Storage.set('categories', CategoryManager.categories);
                await CategoryManager.loadCategoryTree();
                
                Utils.showToast('카테고리가 성공적으로 삭제되었습니다 (데모 모드)', 'success');
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            Utils.showToast(error.message || '카테고리 삭제에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Reorder categories
    reorderCategories: async (categoryOrders) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 카테고리 순서를 변경할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.categories.reorder(categoryOrders);
                
                if (response.success) {
                    await CategoryManager.loadCategories();
                    await CategoryManager.loadCategoryTree();
                    
                    Utils.showToast('카테고리 순서가 변경되었습니다', 'success');
                    
                    return { success: true };
                } else {
                    throw new Error(response.message || '순서 변경 실패');
                }
            } else {
                // LocalStorage mode
                categoryOrders.forEach(({ id, order }) => {
                    const category = CategoryManager.categories.find(c => c.id === id);
                    if (category) {
                        category.order = order;
                    }
                });

                // Sort by order
                CategoryManager.categories.sort((a, b) => a.order - b.order);
                Storage.set('categories', CategoryManager.categories);
                await CategoryManager.loadCategoryTree();
                
                Utils.showToast('카테고리 순서가 변경되었습니다 (데모 모드)', 'success');
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error reordering categories:', error);
            Utils.showToast(error.message || '순서 변경에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Render category tree (recursive)
    renderCategoryTree: (categories, level = 0) => {
        let html = '';
        
        categories.forEach(category => {
            const indent = '  '.repeat(level);
            const hasChildren = category.subcategories && category.subcategories.length > 0;
            const icon = category.icon || '📁';
            
            html += `
                <div class="category-item" data-id="${category._id || category.id}" data-level="${level}">
                    <div class="flex items-center p-2 hover:bg-gray-50 rounded ${level > 0 ? 'ml-' + (level * 4) : ''}">
                        ${hasChildren ? `
                            <button class="toggle-btn mr-2 text-gray-500 hover:text-gray-700" onclick="CategoryManager.toggleCategory(this)">
                                <i class="fas fa-chevron-right transition-transform"></i>
                            </button>
                        ` : '<span class="w-6"></span>'}
                        
                        <span class="text-lg mr-2">${icon}</span>
                        <span class="flex-1 font-medium">${category.name}</span>
                        
                        <span class="text-xs text-gray-500 mr-3">
                            ${category.metadata?.productCount || 0}개 상품
                        </span>
                        
                        ${category.active 
                            ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-2">활성</span>'
                            : '<span class="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-2">비활성</span>'}
                        
                        ${Auth.hasRole('admin') ? `
                            <div class="flex space-x-1">
                                <button onclick="CategoryManager.editCategory('${category._id || category.id}')" 
                                        class="text-blue-600 hover:text-blue-800 p-1">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="CategoryManager.deleteCategory('${category._id || category.id}')" 
                                        class="text-red-600 hover:text-red-800 p-1">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    ${hasChildren ? `
                        <div class="subcategories hidden">
                            ${CategoryManager.renderCategoryTree(category.subcategories, level + 1)}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        return html;
    },

    // Toggle category expansion
    toggleCategory: (button) => {
        const item = button.closest('.category-item');
        const subcategories = item.querySelector('.subcategories');
        const icon = button.querySelector('i');
        
        if (subcategories) {
            subcategories.classList.toggle('hidden');
            icon.classList.toggle('rotate-90');
        }
    },

    // Build tree from flat array
    buildTreeFromFlat: (categories, parentId = null) => {
        return categories
            .filter(cat => cat.parent_id === parentId)
            .map(cat => ({
                ...cat,
                children: CategoryManager.buildTreeFromFlat(categories, cat.id)
            }));
    },

    // Render category dropdown options
    renderCategoryOptions: (categories = null, level = 0, selectedId = null) => {
        if (!categories) {
            categories = CategoryManager.categoryTree;
        }

        let html = '';
        
        categories.forEach(category => {
            const indent = '  '.repeat(level);
            const selected = category._id === selectedId || category.id === selectedId ? 'selected' : '';
            
            html += `<option value="${category._id || category.id}" ${selected}>${indent}${category.icon || ''} ${category.name}</option>`;
            
            if (category.subcategories && category.subcategories.length > 0) {
                html += CategoryManager.renderCategoryOptions(category.subcategories, level + 1, selectedId);
            }
        });
        
        return html;
    },

    // Render category chips/tags
    renderCategoryChips: (categories = null) => {
        if (!categories) {
            categories = CategoryManager.categories.filter(c => c.active && !c.parent);
        }

        return categories.map(category => `
            <button onclick="CategoryManager.filterByCategory('${category._id || category.id}')" 
                    class="category-chip inline-flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition border border-gray-200">
                <span class="text-lg">${category.icon || '📁'}</span>
                <span class="font-medium">${category.name}</span>
                <span class="text-xs text-gray-500">${category.metadata?.productCount || 0}</span>
            </button>
        `).join('');
    },

    // Filter products by category
    filterByCategory: (categoryId) => {
        // This will be handled by the products module
        if (window.ProductManager) {
            ProductManager.filterByCategory(categoryId);
        } else {
            window.location.href = `index.html?category=${categoryId}`;
        }
    },

    // Edit category
    editCategory: async (categoryId) => {
        console.log('Edit category:', categoryId);
        
        // Load category data
        const category = await CategoryManager.getCategoryById(categoryId);
        
        if (category && window.ModalTemplates) {
            ModalTemplates.showCategoryModal(category);
        } else {
            alert('카테고리 데이터를 불러올 수 없습니다');
        }
    }
};

// Export CategoryManager
window.CategoryManager = CategoryManager;

console.log('✅ CategoryManager module loaded');
