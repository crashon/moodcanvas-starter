// Media Manager for Thai Exotic Plants

const MediaManager = {
    allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    maxFileSize: 10 * 1024 * 1024, // 10MB

    // Initialize media manager
    init: () => {
        MediaManager.setupUploadArea();
        MediaManager.loadMedia();
    },

    // Setup upload area
    setupUploadArea: () => {
        const uploadInput = document.getElementById('media-upload');
        if (!uploadInput) return;

        uploadInput.addEventListener('change', MediaManager.handleFileUpload);

        // Drag and drop support
        const uploadArea = uploadInput.closest('.border-2');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('border-green-500', 'bg-green-50');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('border-green-500', 'bg-green-50');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('border-green-500', 'bg-green-50');
                
                const files = e.dataTransfer.files;
                MediaManager.processFiles(files);
            });
        }
    },

    // Handle file upload
    handleFileUpload: (e) => {
        const files = e.target.files;
        MediaManager.processFiles(files);
    },

    // Process uploaded files
    processFiles: async (files) => {
        if (files.length === 0) return;

        // Validate all files first
        const validFiles = Array.from(files).filter(file => {
            if (!MediaManager.validateFile(file)) {
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Show upload progress
        Utils.showToast(`${validFiles.length}개 파일을 업로드하는 중...`, 'info');

        try {
            if (API && API.token) {
                // Upload to API
                const formData = new FormData();
                validFiles.forEach((file, index) => {
                    formData.append('files', file);
                });

                const response = await fetch(`${API.baseURL}/media/upload-multiple`, {
                    method: 'POST',
                    headers: API.getHeaders(),
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                const result = await response.json();
                Utils.showToast(`${result.data.length}개 파일이 업로드되었습니다.`, 'success');
            } else {
                // Fallback to localStorage
                validFiles.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        MediaManager.addMedia({
                            id: Utils.generateId(),
                            name: file.name,
                            type: file.type,
                            size: file.size,
                            url: e.target.result,
                            uploaded_at: new Date().toISOString()
                        });
                    };
                    reader.readAsDataURL(file);
                });
                Utils.showToast(`${validFiles.length}개 파일이 로컬에 저장되었습니다.`, 'success');
            }

            // Reload media
            await MediaManager.loadMedia();
        } catch (error) {
            console.error('Upload error:', error);
            Utils.showToast('업로드에 실패했습니다.', 'error');
        }
    },

    // Validate file
    validateFile: (file) => {
        // Check file type
        const isImage = MediaManager.allowedImageTypes.includes(file.type);
        const isVideo = MediaManager.allowedVideoTypes.includes(file.type);

        if (!isImage && !isVideo) {
            Utils.showToast('지원하지 않는 파일 형식입니다.', 'error');
            return false;
        }

        // Check file size
        if (file.size > MediaManager.maxFileSize) {
            Utils.showToast('파일 크기가 너무 큽니다. (최대 10MB)', 'error');
            return false;
        }

        return true;
    },

    // Add media to storage
    addMedia: (mediaItem) => {
        const media = Storage.get('media') || [];
        media.push(mediaItem);
        Storage.set('media', media);

        Utils.showToast('미디어가 업로드되었습니다.', 'success');
        MediaManager.loadMedia();
    },

    // Load media from API or storage
    loadMedia: async () => {
        const mediaLibrary = document.getElementById('media-library');
        if (!mediaLibrary) return;

        try {
            // Show loading state
            mediaLibrary.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <div class="spinner mx-auto mb-4"></div>
                    <p class="text-gray-500">미디어를 불러오는 중...</p>
                </div>
            `;

            // Try API first, fallback to localStorage
            let media = [];
            if (API && API.token) {
                try {
                    const response = await API.request('/media');
                    media = response.data || [];
                } catch (error) {
                    console.warn('API failed, falling back to localStorage:', error);
                    media = Storage.get('media') || [];
                }
            } else {
                media = Storage.get('media') || [];
            }

            if (media.length === 0) {
                mediaLibrary.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <i class="fas fa-image text-5xl text-gray-300 mb-4"></i>
                        <p class="text-gray-500">업로드된 미디어가 없습니다.</p>
                    </div>
                `;
                return;
            }

            mediaLibrary.innerHTML = media.map(item => {
                const isVideo = item.type.startsWith('video/');
                
                return `
                    <div class="gallery-item relative group" data-media-id="${item.id}">
                        ${isVideo ? `
                            <video src="${item.url || item.data}" class="w-full h-24 object-cover rounded"></video>
                            <div class="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                                <i class="fas fa-video"></i>
                            </div>
                        ` : `
                            <img src="${item.url || item.data}" alt="${item.originalName || item.name}" class="w-full h-24 object-cover rounded">
                        `}
                        <div class="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                            <button onclick="MediaManager.viewMedia('${item.id}')" 
                                    class="text-white hover:text-blue-400 p-2 rounded-full hover:bg-blue-500 bg-opacity-50"
                                    title="미리보기">
                                <i class="fas fa-eye text-xl"></i>
                            </button>
                            <button onclick="MediaManager.copyUrl('${item.id}')" 
                                    class="text-white hover:text-green-400 p-2 rounded-full hover:bg-green-500 bg-opacity-50"
                                    title="URL 복사">
                                <i class="fas fa-copy text-xl"></i>
                            </button>
                            <button onclick="MediaManager.deleteMedia('${item.id}')" 
                                    class="text-white hover:text-red-400 p-2 rounded-full hover:bg-red-500 bg-opacity-50"
                                    title="삭제">
                                <i class="fas fa-trash text-xl"></i>
                            </button>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 truncate opacity-0 group-hover:opacity-100 transition">
                            ${item.originalName || item.name}
                        </div>
                    </div>
                `;
            }).join('');
        } catch (error) {
            console.error('Error loading media:', error);
            mediaLibrary.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                    <p class="text-red-500">미디어를 불러오는데 실패했습니다.</p>
                </div>
            `;
        }
    },

    // View media in modal
    viewMedia: (mediaId) => {
        const media = Storage.get('media') || [];
        const item = media.find(m => m.id === mediaId);

        if (!item) return;

        const isVideo = item.type.startsWith('video/');

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="relative max-w-4xl w-full">
                <button class="close-modal absolute top-4 right-4 text-white text-3xl hover:text-gray-300">
                    <i class="fas fa-times"></i>
                </button>
                <div class="bg-white rounded-lg p-2">
                    ${isVideo ? `
                        <video src="${item.url}" controls class="w-full max-h-[80vh] rounded"></video>
                    ` : `
                        <img src="${item.url}" alt="${item.name}" class="w-full max-h-[80vh] object-contain rounded">
                    `}
                </div>
                <div class="bg-white mt-2 p-4 rounded-lg">
                    <p class="font-medium">${item.name}</p>
                    <p class="text-sm text-gray-500">크기: ${MediaManager.formatFileSize(item.size)}</p>
                    <p class="text-sm text-gray-500">업로드: ${Utils.formatDate(item.uploaded_at)}</p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal
        modal.querySelector('.close-modal').onclick = () => modal.remove();
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    // Copy media URL
    copyUrl: (mediaId) => {
        const media = Storage.get('media') || [];
        const item = media.find(m => m.id === mediaId);

        if (!item) {
            Utils.showToast('미디어를 찾을 수 없습니다.', 'error');
            return;
        }

        const url = item.url || item.data;
        if (!url) {
            Utils.showToast('URL이 없습니다.', 'error');
            return;
        }

        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            Utils.showToast(`URL이 복사되었습니다: ${url.substring(0, 50)}...`, 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = url;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                Utils.showToast(`URL이 복사되었습니다: ${url.substring(0, 50)}...`, 'success');
            } catch (err) {
                Utils.showToast('URL 복사에 실패했습니다.', 'error');
            }
            document.body.removeChild(textArea);
        });
    },

    // Delete media
    deleteMedia: async (mediaId) => {
        if (!confirm('정말 이 미디어를 삭제하시겠습니까?')) return;

        try {
            if (API && API.token) {
                // Delete from API
                const media = Storage.get('media') || [];
                const mediaItem = media.find(m => m.id === mediaId);
                
                if (mediaItem && mediaItem.filename) {
                    await API.request(`/media/${mediaItem.filename}`, {
                        method: 'DELETE'
                    });
                }
            } else {
                // Delete from localStorage
                let media = Storage.get('media') || [];
                media = media.filter(m => m.id !== mediaId);
                Storage.set('media', media);
            }

            Utils.showToast('미디어가 삭제되었습니다.', 'success');
            await MediaManager.loadMedia();
        } catch (error) {
            console.error('Delete error:', error);
            Utils.showToast('삭제에 실패했습니다.', 'error');
        }
    },

    // Format file size
    formatFileSize: (bytes) => {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    },

    // Get media by ID
    getMediaById: (mediaId) => {
        const media = Storage.get('media') || [];
        return media.find(m => m.id === mediaId);
    },

    // Get all media URLs
    getAllMediaUrls: () => {
        const media = Storage.get('media') || [];
        return media.map(m => m.url);
    },

    // Filter media by type
    filterByType: (type) => {
        const media = Storage.get('media') || [];
        return media.filter(m => m.type.startsWith(type + '/'));
    }
};

// Initialize media manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('media-library')) {
        MediaManager.init();
    }
});

// Export MediaManager
window.MediaManager = MediaManager;
