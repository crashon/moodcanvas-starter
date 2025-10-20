// Modal System for Thai Exotic Plants
// Universal modal framework with various templates

const Modal = {
    currentModal: null,
    modalStack: [],

    // Initialize modal system
    init: () => {
        // Create modal container if not exists
        if (!document.getElementById('modal-container')) {
            const container = document.createElement('div');
            container.id = 'modal-container';
            document.body.appendChild(container);
        }

        // Close modal on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && Modal.currentModal) {
                Modal.close();
            }
        });

        console.log('✅ Modal system initialized');
    },

    // Show modal with content
    show: (options = {}) => {
        const {
            title = '모달',
            content = '',
            size = 'medium',
            showClose = true,
            closeOnOverlay = true,
            onClose = null,
            className = ''
        } = options;

        const modalId = 'modal-' + Date.now();
        const sizeClasses = {
            small: 'max-w-md',
            medium: 'max-w-2xl',
            large: 'max-w-4xl',
            full: 'max-w-full mx-4'
        };

        const modalHTML = `
            <div id="${modalId}" class="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div class="modal-content bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] flex flex-col ${className}">
                    <div class="modal-header flex items-center justify-between p-6 border-b">
                        <h2 class="text-2xl font-bold text-gray-800">${title}</h2>
                        ${showClose ? `
                            <button onclick="Modal.close()" class="text-gray-400 hover:text-gray-600 transition">
                                <i class="fas fa-times text-2xl"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="modal-body flex-1 overflow-y-auto p-6">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        const container = document.getElementById('modal-container');
        container.insertAdjacentHTML('beforeend', modalHTML);

        Modal.currentModal = {
            id: modalId,
            onClose: onClose
        };
        Modal.modalStack.push(Modal.currentModal);

        if (closeOnOverlay) {
            const overlay = document.getElementById(modalId);
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    Modal.close();
                }
            });
        }

        document.body.style.overflow = 'hidden';
        return modalId;
    },

    // Close current modal
    close: () => {
        if (!Modal.currentModal) return;

        const modalElement = document.getElementById(Modal.currentModal.id);
        if (modalElement) {
            modalElement.remove();
            
            if (Modal.currentModal.onClose) {
                Modal.currentModal.onClose();
            }

            Modal.modalStack.pop();
            Modal.currentModal = Modal.modalStack[Modal.modalStack.length - 1] || null;

            if (Modal.modalStack.length === 0) {
                document.body.style.overflow = '';
            }
        }
    },

    // Confirmation dialog
    confirm: (options = {}) => {
        return new Promise((resolve) => {
            const {
                title = '확인',
                message = '진행하시겠습니까?',
                confirmText = '확인',
                cancelText = '취소'
            } = options;

            const content = `
                <div class="text-center">
                    <div class="mb-6">
                        <i class="fas fa-question-circle text-6xl text-blue-500 mb-4"></i>
                        <p class="text-lg text-gray-700">${message}</p>
                    </div>
                    <div class="flex space-x-4">
                        <button onclick="Modal.resolveConfirm(false)" 
                                class="flex-1 px-6 py-3 rounded-lg text-white font-medium transition bg-gray-500 hover:bg-gray-600">
                            ${cancelText}
                        </button>
                        <button onclick="Modal.resolveConfirm(true)" 
                                class="flex-1 px-6 py-3 rounded-lg text-white font-medium transition bg-green-600 hover:bg-green-700">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            `;

            Modal._confirmResolve = resolve;
            Modal.show({
                title: title,
                content: content,
                size: 'small',
                closeOnOverlay: false
            });
        });
    },

    resolveConfirm: (result) => {
        if (Modal._confirmResolve) {
            Modal._confirmResolve(result);
            Modal._confirmResolve = null;
        }
        Modal.close();
    },

    // Alert dialog
    alert: (options = {}) => {
        return new Promise((resolve) => {
            const {
                title = '알림',
                message = '',
                type = 'info',
                buttonText = '확인'
            } = options;

            const icons = {
                info: { icon: 'fa-info-circle', color: 'text-blue-500' },
                success: { icon: 'fa-check-circle', color: 'text-green-500' },
                warning: { icon: 'fa-exclamation-triangle', color: 'text-yellow-500' },
                error: { icon: 'fa-times-circle', color: 'text-red-500' }
            };

            const { icon, color } = icons[type];

            const content = `
                <div class="text-center">
                    <div class="mb-6">
                        <i class="fas ${icon} text-6xl ${color} mb-4"></i>
                        <p class="text-lg text-gray-700">${message}</p>
                    </div>
                    <button onclick="Modal.resolveAlert()" 
                            class="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition">
                        ${buttonText}
                    </button>
                </div>
            `;

            Modal._alertResolve = resolve;
            Modal.show({
                title: title,
                content: content,
                size: 'small',
                closeOnOverlay: false
            });
        });
    },

    resolveAlert: () => {
        if (Modal._alertResolve) {
            Modal._alertResolve();
            Modal._alertResolve = null;
        }
        Modal.close();
    },

    // Image viewer
    showImage: (imageUrl, title = '이미지 보기') => {
        const content = `
            <div class="text-center">
                <img src="${imageUrl}" 
                     alt="${title}" 
                     class="max-w-full max-h-[70vh] mx-auto rounded-lg shadow-lg">
            </div>
        `;

        Modal.show({
            title: title,
            content: content,
            size: 'large',
            closeOnOverlay: true
        });
    },

    // Form modal
    showForm: (options = {}) => {
        const {
            title = '폼',
            fields = [],
            submitText = '제출',
            onSubmit = null,
            size = 'medium'
        } = options;

        const formId = 'form-' + Date.now();
        
        const fieldsHTML = fields.map(field => {
            const { name, label, type, placeholder, required, value, options } = field;
            
            let inputHTML = '';
            
            switch (type) {
                case 'textarea':
                    inputHTML = `
                        <textarea 
                            name="${name}" 
                            id="${name}"
                            placeholder="${placeholder || ''}"
                            ${required ? 'required' : ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            rows="4">${value || ''}</textarea>
                    `;
                    break;
                case 'select':
                    const optionsHTML = options.map(opt => 
                        `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                    inputHTML = `
                        <select 
                            name="${name}" 
                            id="${name}"
                            ${required ? 'required' : ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                            ${optionsHTML}
                        </select>
                    `;
                    break;
                case 'checkbox':
                    inputHTML = `
                        <div class="flex items-center">
                            <input 
                                type="checkbox" 
                                name="${name}" 
                                id="${name}"
                                ${value ? 'checked' : ''}
                                class="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500">
                            <label for="${name}" class="ml-2 text-sm text-gray-700">${label}</label>
                        </div>
                    `;
                    break;
                case 'image-selector':
                    inputHTML = `
                        <div class="image-selector-container">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-medium text-gray-700">선택된 이미지 (${Array.isArray(value) ? value.length : 0}개)</span>
                                <button type="button" onclick="ModalTemplates.openImageSelector('${name}')" 
                                        class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition">
                                    <i class="fas fa-plus mr-1"></i>이미지 선택
                                </button>
                            </div>
                            <div id="${name}-preview" class="grid grid-cols-4 gap-2 min-h-[100px] border border-gray-200 rounded-lg p-2">
                                ${Array.isArray(value) ? value.map((img, index) => `
                                    <div class="relative group">
                                        <img src="${img}" alt="상품 이미지 ${index + 1}" class="w-full h-20 object-cover rounded">
                                        <button type="button" onclick="ModalTemplates.removeImage('${name}', ${index})" 
                                                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                `).join('') : ''}
                            </div>
                            <input type="hidden" name="${name}" id="${name}" value="${Array.isArray(value) ? JSON.stringify(value) : '[]'}">
                        </div>
                    `;
                    break;
                default:
                    inputHTML = `
                        <input 
                            type="${type || 'text'}" 
                            name="${name}" 
                            id="${name}"
                            placeholder="${placeholder || ''}"
                            value="${value || ''}"
                            ${required ? 'required' : ''}
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                    `;
            }

            if (type === 'checkbox') {
                return inputHTML;
            }

            return `
                <div class="mb-4">
                    <label for="${name}" class="block text-sm font-medium text-gray-700 mb-2">
                        ${label} ${required ? '<span class="text-red-500">*</span>' : ''}
                    </label>
                    ${inputHTML}
                </div>
            `;
        }).join('');

        const content = `
            <form id="${formId}" class="space-y-4">
                ${fieldsHTML}
                <div class="flex space-x-4 pt-4">
                    <button type="button" onclick="Modal.close()" 
                            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" 
                            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
                        ${submitText}
                    </button>
                </div>
            </form>
        `;

        const modalId = Modal.show({
            title: title,
            content: content,
            size: size,
            closeOnOverlay: false
        });

        // Add form submit handler
        const form = document.getElementById(formId);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                if (data[key]) {
                    // Handle multiple values (like checkboxes)
                    if (Array.isArray(data[key])) {
                        data[key].push(value);
                    } else {
                        data[key] = [data[key], value];
                    }
                } else {
                    data[key] = value;
                }
            }

            // Handle checkboxes
            fields.forEach(field => {
                if (field.type === 'checkbox') {
                    data[field.name] = form.querySelector(`#${field.name}`).checked;
                }
            });

            if (onSubmit) {
                try {
                    await onSubmit(data);
                } catch (error) {
                    console.error('Form submit error:', error);
                }
            }
        });

        return modalId;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Modal.init();
});

window.Modal = Modal;

console.log('✅ Modal system loaded');
