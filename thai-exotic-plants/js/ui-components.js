// UI Components Library for Thai Exotic Plants
// Reusable UI components and widgets

const UI = {
    // Loading spinner
    showLoading: (container, message = '로딩 중...') => {
        const loadingHTML = `
            <div class="loading-container flex flex-col items-center justify-center py-12">
                <div class="loading-spinner mb-4"></div>
                <p class="text-gray-600">${message}</p>
            </div>
        `;

        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }

        if (container) {
            container.innerHTML = loadingHTML;
        }
    },

    // Hide loading
    hideLoading: (container) => {
        if (typeof container === 'string') {
            container = document.getElementById(container) || document.querySelector(container);
        }

        if (container) {
            const loadingEl = container.querySelector('.loading-container');
            if (loadingEl) {
                loadingEl.remove();
            }
        }
    },

    // Progress bar
    progressBar: (percent, options = {}) => {
        const {
            color = 'green',
            height = '4',
            showLabel = true,
            label = `${percent}%`,
            animated = true
        } = options;

        const colorClasses = {
            green: 'bg-green-600',
            blue: 'bg-blue-600',
            red: 'bg-red-600',
            yellow: 'bg-yellow-600'
        };

        return `
            <div class="progress-bar-container w-full">
                ${showLabel ? `<div class="text-sm text-gray-600 mb-2">${label}</div>` : ''}
                <div class="w-full bg-gray-200 rounded-full h-${height} overflow-hidden">
                    <div class="${colorClasses[color]} h-${height} rounded-full transition-all duration-500 ${animated ? 'progress-animated' : ''}"
                         style="width: ${percent}%"></div>
                </div>
            </div>
        `;
    },

    // Empty state
    emptyState: (options = {}) => {
        const {
            icon = 'fa-inbox',
            title = '데이터가 없습니다',
            message = '',
            actionText = '',
            onAction = null
        } = options;

        return `
            <div class="empty-state text-center py-12">
                <i class="fas ${icon} text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">${title}</h3>
                ${message ? `<p class="text-gray-600 mb-6">${message}</p>` : ''}
                ${actionText && onAction ? `
                    <button onclick="${onAction}" 
                            class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        ${actionText}
                    </button>
                ` : ''}
            </div>
        `;
    },

    // Error state
    errorState: (options = {}) => {
        const {
            title = '오류가 발생했습니다',
            message = '다시 시도해주세요',
            actionText = '새로고침',
            onAction = 'location.reload()'
        } = options;

        return `
            <div class="error-state text-center py-12">
                <i class="fas fa-exclamation-triangle text-6xl text-red-500 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">${title}</h3>
                <p class="text-gray-600 mb-6">${message}</p>
                <button onclick="${onAction}" 
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    ${actionText}
                </button>
            </div>
        `;
    },

    // Badge
    badge: (text, type = 'default') => {
        const typeClasses = {
            default: 'bg-gray-100 text-gray-800',
            primary: 'bg-blue-100 text-blue-800',
            success: 'bg-green-100 text-green-800',
            warning: 'bg-yellow-100 text-yellow-800',
            danger: 'bg-red-100 text-red-800',
            info: 'bg-cyan-100 text-cyan-800'
        };

        return `<span class="badge inline-block px-3 py-1 rounded-full text-xs font-medium ${typeClasses[type]}">${text}</span>`;
    },

    // Avatar
    avatar: (name, imageUrl = null, size = 'medium') => {
        const sizeClasses = {
            small: 'w-8 h-8 text-sm',
            medium: 'w-12 h-12 text-base',
            large: 'w-16 h-16 text-lg'
        };

        const initial = name ? name.charAt(0).toUpperCase() : '?';

        if (imageUrl) {
            return `
                <div class="avatar ${sizeClasses[size]} rounded-full overflow-hidden">
                    <img src="${imageUrl}" alt="${name}" class="w-full h-full object-cover">
                </div>
            `;
        } else {
            return `
                <div class="avatar ${sizeClasses[size]} rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                    ${initial}
                </div>
            `;
        }
    },

    // Tooltip
    tooltip: (text, content) => {
        return `
            <div class="tooltip-container relative inline-block">
                <span class="tooltip-trigger">${text}</span>
                <div class="tooltip-content absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap opacity-0 pointer-events-none transition-opacity duration-200">
                    ${content}
                    <div class="tooltip-arrow absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                </div>
            </div>
        `;
    },

    // Dropdown menu
    dropdown: (buttonText, items, options = {}) => {
        const {
            icon = 'fa-chevron-down',
            buttonClass = 'bg-white border border-gray-300 hover:bg-gray-50'
        } = options;

        const dropdownId = 'dropdown-' + Date.now();

        const itemsHTML = items.map(item => {
            if (item.divider) {
                return '<div class="border-t border-gray-200 my-1"></div>';
            }

            return `
                <a href="${item.href || '#'}" 
                   onclick="${item.onclick || ''}"
                   class="dropdown-item block px-4 py-2 text-gray-700 hover:bg-gray-100 transition ${item.class || ''}">
                    ${item.icon ? `<i class="fas ${item.icon} mr-2"></i>` : ''}
                    ${item.text}
                </a>
            `;
        }).join('');

        return `
            <div class="dropdown relative inline-block" id="${dropdownId}">
                <button onclick="UI.toggleDropdown('${dropdownId}')" 
                        class="dropdown-button px-4 py-2 rounded-lg font-medium transition ${buttonClass}">
                    ${buttonText}
                    <i class="fas ${icon} ml-2"></i>
                </button>
                <div class="dropdown-menu absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 hidden z-10">
                    ${itemsHTML}
                </div>
            </div>
        `;
    },

    // Toggle dropdown
    toggleDropdown: (dropdownId) => {
        const dropdown = document.getElementById(dropdownId);
        if (!dropdown) return;

        const menu = dropdown.querySelector('.dropdown-menu');
        if (!menu) return;

        menu.classList.toggle('hidden');

        // Close when clicking outside
        if (!menu.classList.contains('hidden')) {
            setTimeout(() => {
                document.addEventListener('click', function closeDropdown(e) {
                    if (!dropdown.contains(e.target)) {
                        menu.classList.add('hidden');
                        document.removeEventListener('click', closeDropdown);
                    }
                });
            }, 0);
        }
    },

    // Tabs
    tabs: (tabs, options = {}) => {
        const {
            defaultTab = 0,
            onTabChange = null
        } = options;

        const tabsId = 'tabs-' + Date.now();

        const tabButtons = tabs.map((tab, index) => `
            <button onclick="UI.switchTab('${tabsId}', ${index})" 
                    class="tab-button px-6 py-3 font-medium transition ${index === defaultTab ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-600 hover:text-gray-800'}"
                    data-tab="${index}">
                ${tab.icon ? `<i class="fas ${tab.icon} mr-2"></i>` : ''}
                ${tab.title}
            </button>
        `).join('');

        const tabContents = tabs.map((tab, index) => `
            <div class="tab-content ${index === defaultTab ? '' : 'hidden'}" data-tab="${index}">
                ${tab.content}
            </div>
        `).join('');

        return `
            <div class="tabs-container" id="${tabsId}">
                <div class="tabs-header flex border-b border-gray-200 mb-6">
                    ${tabButtons}
                </div>
                <div class="tabs-body">
                    ${tabContents}
                </div>
            </div>
        `;
    },

    // Switch tab
    switchTab: (tabsId, tabIndex) => {
        const container = document.getElementById(tabsId);
        if (!container) return;

        // Update buttons
        const buttons = container.querySelectorAll('.tab-button');
        buttons.forEach((btn, index) => {
            if (index === tabIndex) {
                btn.classList.add('border-b-2', 'border-green-600', 'text-green-600');
                btn.classList.remove('text-gray-600');
            } else {
                btn.classList.remove('border-b-2', 'border-green-600', 'text-green-600');
                btn.classList.add('text-gray-600');
            }
        });

        // Update content
        const contents = container.querySelectorAll('.tab-content');
        contents.forEach((content, index) => {
            if (index === tabIndex) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    },

    // Card
    card: (options = {}) => {
        const {
            title = '',
            content = '',
            footer = '',
            className = '',
            headerAction = ''
        } = options;

        return `
            <div class="card bg-white rounded-xl shadow-md overflow-hidden ${className}">
                ${title || headerAction ? `
                    <div class="card-header flex items-center justify-between p-6 border-b">
                        ${title ? `<h3 class="text-xl font-bold text-gray-800">${title}</h3>` : ''}
                        ${headerAction ? `<div>${headerAction}</div>` : ''}
                    </div>
                ` : ''}
                <div class="card-body p-6">
                    ${content}
                </div>
                ${footer ? `
                    <div class="card-footer p-6 border-t bg-gray-50">
                        ${footer}
                    </div>
                ` : ''}
            </div>
        `;
    },

    // Pagination
    pagination: (currentPage, totalPages, onPageChange) => {
        const pages = [];
        const maxVisible = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        // Previous button
        pages.push(`
            <button onclick="${onPageChange}(${currentPage - 1})" 
                    ${currentPage === 1 ? 'disabled' : ''}
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <i class="fas fa-chevron-left"></i>
            </button>
        `);

        // First page
        if (startPage > 1) {
            pages.push(`
                <button onclick="${onPageChange}(1)" 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    1
                </button>
            `);
            if (startPage > 2) {
                pages.push(`<span class="px-2 py-2 text-gray-500">...</span>`);
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(`
                <button onclick="${onPageChange}(${i})" 
                        class="px-4 py-2 border ${i === currentPage ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300 hover:bg-gray-50'} rounded-lg transition">
                    ${i}
                </button>
            `);
        }

        // Last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                pages.push(`<span class="px-2 py-2 text-gray-500">...</span>`);
            }
            pages.push(`
                <button onclick="${onPageChange}(${totalPages})" 
                        class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    ${totalPages}
                </button>
            `);
        }

        // Next button
        pages.push(`
            <button onclick="${onPageChange}(${currentPage + 1})" 
                    ${currentPage === totalPages ? 'disabled' : ''}
                    class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition">
                <i class="fas fa-chevron-right"></i>
            </button>
        `);

        return `
            <div class="pagination flex items-center justify-center space-x-2">
                ${pages.join('')}
            </div>
        `;
    }
};

// Export UI object
window.UI = UI;

console.log('✅ UI Components loaded');
