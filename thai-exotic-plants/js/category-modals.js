// Category Modal Functions for Thai Exotic Plants
// Modals for creating and editing categories

const CategoryModals = {
    // Show category create modal
    showCreateCategoryModal: async () => {
        // Load categories for parent selection
        await CategoryManager.loadCategories();

        const parentOptions = CategoryManager.renderCategoryOptions(
            CategoryManager.categoryTree,
            0,
            null
        );

        const content = `
            <form id="create-category-form" class="space-y-4">
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 이름 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           name="name" 
                           required
                           placeholder="예: 열대식물"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        설명
                    </label>
                    <textarea name="description" 
                              placeholder="카테고리 설명을 입력하세요"
                              rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            아이콘 (이모지)
                        </label>
                        <input type="text" 
                               name="icon" 
                               placeholder="🌴"
                               maxlength="2"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            순서
                        </label>
                        <input type="number" 
                               name="order" 
                               value="0"
                               min="0"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        부모 카테고리
                    </label>
                    <select name="parent" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">없음 (최상위 카테고리)</option>
                        ${parentOptions}
                    </select>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        이미지 URL
                    </label>
                    <input type="url" 
                           name="image" 
                           placeholder="https://example.com/category.jpg"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group flex items-center space-x-4">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" 
                               name="active" 
                               checked
                               class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">활성화</span>
                    </label>

                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" 
                               name="featured" 
                               class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">추천 카테고리</span>
                    </label>
                </div>

                <div class="flex space-x-4 pt-4">
                    <button type="button" 
                            onclick="Modal.close()" 
                            class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" 
                            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                        <i class="fas fa-check mr-2"></i>카테고리 생성
                    </button>
                </div>
            </form>
        `;

        Modal.show({
            title: '새 카테고리 생성',
            content: content,
            size: 'medium',
            closeOnOverlay: false
        });

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('create-category-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await CategoryModals.handleCreateCategory(new FormData(form));
                });
            }
        }, 100);
    },

    // Handle category creation
    handleCreateCategory: async (formData) => {
        const categoryData = {
            name: formData.get('name'),
            name_en: formData.get('name_en') || undefined,
            description: formData.get('description') || undefined,
            icon: formData.get('icon') || 'fa-tag',
            parent_id: formData.get('parent') || null,
            is_active: formData.get('active') === 'on'
        };

        try {
            const result = await DataSource.createCategory(categoryData);
            if (result) {
                Utils.showToast('카테고리가 생성되었습니다.', 'success');
                Modal.close();
                
                // Reload categories if on categories page
                if (typeof loadCategories === 'function') {
                    loadCategories();
                }
            } else {
                Utils.showToast('카테고리 생성에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Create category error:', error);
            Utils.showToast('카테고리 생성 중 오류가 발생했습니다.', 'error');
        }
    },

    // Show category edit modal
    showEditCategoryModal: async (categoryId) => {
        // Load category data
        const category = await CategoryManager.getCategoryById(categoryId);
        if (!category) {
            Utils.showToast('카테고리를 찾을 수 없습니다', 'error');
            return;
        }

        // Load all categories for parent selection
        await CategoryManager.loadCategories();
        const parentOptions = CategoryManager.renderCategoryOptions(
            CategoryManager.categoryTree,
            0,
            category.parent
        );

        const content = `
            <form id="edit-category-form" class="space-y-4">
                <input type="hidden" name="categoryId" value="${categoryId}">
                
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        카테고리 이름 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" 
                           name="name" 
                           required
                           value="${category.name || ''}"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        설명
                    </label>
                    <textarea name="description" 
                              rows="3"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">${category.description || ''}</textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            아이콘 (이모지)
                        </label>
                        <input type="text" 
                               name="icon" 
                               value="${category.icon || ''}"
                               maxlength="2"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>

                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            순서
                        </label>
                        <input type="number" 
                               name="order" 
                               value="${category.order || 0}"
                               min="0"
                               class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    </div>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        부모 카테고리
                    </label>
                    <select name="parent" 
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                        <option value="">없음 (최상위 카테고리)</option>
                        ${parentOptions}
                    </select>
                    <p class="text-xs text-gray-500 mt-1">* 현재 카테고리는 선택할 수 없습니다</p>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        이미지 URL
                    </label>
                    <input type="url" 
                           name="image" 
                           value="${category.image || ''}"
                           placeholder="https://example.com/category.jpg"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group flex items-center space-x-4">
                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" 
                               name="active" 
                               ${category.active ? 'checked' : ''}
                               class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">활성화</span>
                    </label>

                    <label class="flex items-center cursor-pointer">
                        <input type="checkbox" 
                               name="featured" 
                               ${category.featured ? 'checked' : ''}
                               class="w-5 h-5 text-green-600 rounded focus:ring-green-500">
                        <span class="ml-2 text-sm font-medium text-gray-700">추천 카테고리</span>
                    </label>
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
            title: '카테고리 수정',
            content: content,
            size: 'medium',
            closeOnOverlay: false
        });

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('edit-category-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await CategoryModals.handleEditCategory(new FormData(form));
                });
            }
        }, 100);
    },

    // Handle category editing
    handleEditCategory: async (formData) => {
        const categoryId = formData.get('categoryId');
        const categoryData = {
            name: formData.get('name'),
            name_en: formData.get('name_en') || undefined,
            description: formData.get('description') || undefined,
            icon: formData.get('icon') || 'fa-tag',
            parent_id: formData.get('parent') || null,
            is_active: formData.get('active') === 'on'
        };

        try {
            const result = await DataSource.updateCategory(categoryId, categoryData);
            if (result) {
                Utils.showToast('카테고리가 수정되었습니다.', 'success');
                Modal.close();
                
                // Reload categories if on categories page
                if (typeof loadCategories === 'function') {
                    loadCategories();
                }
            } else {
                Utils.showToast('카테고리 수정에 실패했습니다.', 'error');
            }
        } catch (error) {
            console.error('Update category error:', error);
            Utils.showToast('카테고리 수정 중 오류가 발생했습니다.', 'error');
        }
    }
};

// Export CategoryModals
window.CategoryModals = CategoryModals;

// Make editCategory use the modal (wait for CategoryManager to be loaded)
document.addEventListener('DOMContentLoaded', () => {
    if (window.CategoryManager) {
        CategoryManager.editCategory = (categoryId) => {
            CategoryModals.showEditCategoryModal(categoryId);
        };
    }
});

console.log('✅ Category Modals loaded');
