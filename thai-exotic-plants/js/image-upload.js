/**
 * Image Upload Manager
 * 드래그 앤 드롭, 다중 업로드, 미리보기, 이미지 압축 지원
 * 
 * 사용 예시:
 * const uploader = new ImageUploader({
 *     containerId: 'upload-area',
 *     maxFiles: 5,
 *     maxSize: 5 * 1024 * 1024,
 *     onUpload: (files) => { ... }
 * });
 */

class ImageUploader {
    constructor(options) {
        this.options = {
            containerId: '',           // 드롭 영역 ID
            maxFiles: 5,               // 최대 파일 수
            maxSize: 5 * 1024 * 1024,  // 최대 파일 크기 (5MB)
            acceptedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
            compress: true,            // 이미지 압축 활성화
            maxWidth: 1920,            // 압축 시 최대 너비
            maxHeight: 1920,           // 압축 시 최대 높이
            quality: 0.8,              // 압축 품질 (0-1)
            onUpload: null,            // 업로드 완료 콜백
            onProgress: null,          // 진행률 콜백
            onError: null,             // 에러 콜백
            ...options
        };

        this.files = [];
        this.previews = [];
        this.init();
    }

    /**
     * 초기화
     */
    init() {
        this.container = document.getElementById(this.options.containerId);
        if (!this.container) {
            console.error('Container not found:', this.options.containerId);
            return;
        }

        this.setupDropZone();
        this.setupFileInput();
        this.render();
    }

    /**
     * 드롭 영역 설정
     */
    setupDropZone() {
        // 드래그 오버 방지
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.container.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // 드래그 오버 시 스타일 변경
        ['dragenter', 'dragover'].forEach(eventName => {
            this.container.addEventListener(eventName, () => {
                this.container.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.container.addEventListener(eventName, () => {
                this.container.classList.remove('drag-over');
            });
        });

        // 드롭 이벤트
        this.container.addEventListener('drop', (e) => {
            const files = Array.from(e.dataTransfer.files);
            this.handleFiles(files);
        });
    }

    /**
     * 파일 입력 설정
     */
    setupFileInput() {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = this.options.maxFiles > 1;
        input.accept = this.options.acceptedTypes.join(',');
        input.style.display = 'none';
        input.id = `file-input-${this.options.containerId}`;

        input.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            this.handleFiles(files);
        });

        this.container.appendChild(input);
        this.fileInput = input;
    }

    /**
     * 파일 처리
     */
    async handleFiles(files) {
        // 파일 수 체크
        if (this.files.length + files.length > this.options.maxFiles) {
            this.handleError(`최대 ${this.options.maxFiles}개의 파일만 업로드할 수 있습니다.`);
            return;
        }

        // 각 파일 처리
        for (const file of files) {
            // 파일 타입 체크
            if (!this.options.acceptedTypes.includes(file.type)) {
                this.handleError(`${file.name}: 지원하지 않는 파일 형식입니다.`);
                continue;
            }

            // 파일 크기 체크
            if (file.size > this.options.maxSize) {
                const sizeMB = (this.options.maxSize / 1024 / 1024).toFixed(1);
                this.handleError(`${file.name}: 파일 크기가 ${sizeMB}MB를 초과합니다.`);
                continue;
            }

            try {
                // 이미지 압축
                const processedFile = this.options.compress 
                    ? await this.compressImage(file)
                    : file;

                // 미리보기 생성
                const preview = await this.createPreview(processedFile, file.name);

                this.files.push(processedFile);
                this.previews.push(preview);

            } catch (error) {
                this.handleError(`${file.name}: 처리 중 오류가 발생했습니다.`);
                console.error(error);
            }
        }

        this.render();
        this.notifyUpload();
    }

    /**
     * 이미지 압축
     */
    compressImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // 크기 조정
                    if (width > this.options.maxWidth || height > this.options.maxHeight) {
                        const ratio = Math.min(
                            this.options.maxWidth / width,
                            this.options.maxHeight / height
                        );
                        width *= ratio;
                        height *= ratio;
                    }

                    canvas.width = width;
                    canvas.height = height;

                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    // Blob으로 변환
                    canvas.toBlob(
                        (blob) => {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        },
                        file.type,
                        this.options.quality
                    );
                };

                img.onerror = reject;
                img.src = e.target.result;
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * 미리보기 생성
     */
    createPreview(file, originalName) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve({
                    id: Date.now() + Math.random(),
                    name: originalName,
                    size: file.size,
                    url: e.target.result,
                    file: file
                });
            };

            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * UI 렌더링
     */
    render() {
        const uploadArea = this.container.querySelector('.upload-area') || this.createUploadArea();
        const previewArea = this.container.querySelector('.preview-area') || this.createPreviewArea();

        // 미리보기 업데이트
        this.renderPreviews(previewArea);

        // 업로드 영역 표시/숨김
        if (this.files.length >= this.options.maxFiles) {
            uploadArea.style.display = 'none';
        } else {
            uploadArea.style.display = 'block';
        }
    }

    /**
     * 업로드 영역 생성
     */
    createUploadArea() {
        const area = document.createElement('div');
        area.className = 'upload-area';
        area.innerHTML = `
            <div class="upload-icon">
                <i class="fas fa-cloud-upload-alt"></i>
            </div>
            <div class="upload-text">
                <p class="upload-title">이미지를 드래그하거나 클릭하여 업로드</p>
                <p class="upload-subtitle">
                    최대 ${this.options.maxFiles}개, ${(this.options.maxSize / 1024 / 1024).toFixed(1)}MB 이하
                </p>
            </div>
            <button type="button" class="upload-button" onclick="document.getElementById('${this.fileInput.id}').click()">
                파일 선택
            </button>
        `;

        // 클릭 이벤트
        area.addEventListener('click', (e) => {
            if (e.target.classList.contains('upload-button')) return;
            this.fileInput.click();
        });

        this.container.appendChild(area);
        return area;
    }

    /**
     * 미리보기 영역 생성
     */
    createPreviewArea() {
        const area = document.createElement('div');
        area.className = 'preview-area';
        this.container.appendChild(area);
        return area;
    }

    /**
     * 미리보기 렌더링
     */
    renderPreviews(container) {
        container.innerHTML = this.previews.map(preview => `
            <div class="image-preview" data-id="${preview.id}">
                <img src="${preview.url}" alt="${preview.name}">
                <div class="preview-overlay">
                    <button type="button" class="preview-remove" onclick="window.imageUploader_${this.options.containerId}.removeFile('${preview.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="preview-info">
                    <div class="preview-name">${this.truncateName(preview.name, 20)}</div>
                    <div class="preview-size">${this.formatSize(preview.size)}</div>
                </div>
            </div>
        `).join('');
    }

    /**
     * 파일 제거
     */
    removeFile(id) {
        const index = this.previews.findIndex(p => p.id === id);
        if (index > -1) {
            this.previews.splice(index, 1);
            this.files.splice(index, 1);
            this.render();
            this.notifyUpload();
        }
    }

    /**
     * 모든 파일 제거
     */
    clear() {
        this.files = [];
        this.previews = [];
        this.render();
    }

    /**
     * 파일 가져오기
     */
    getFiles() {
        return this.files;
    }

    /**
     * 미리보기 URL 가져오기
     */
    getPreviewUrls() {
        return this.previews.map(p => p.url);
    }

    /**
     * 업로드 알림
     */
    notifyUpload() {
        if (this.options.onUpload) {
            this.options.onUpload(this.files, this.previews);
        }
    }

    /**
     * 에러 처리
     */
    handleError(message) {
        if (this.options.onError) {
            this.options.onError(message);
        } else if (typeof Toast !== 'undefined') {
            Toast.error(message);
        } else {
            console.error(message);
        }
    }

    /**
     * 파일명 축약
     */
    truncateName(name, maxLength) {
        if (name.length <= maxLength) return name;
        const ext = name.split('.').pop();
        const nameWithoutExt = name.substring(0, name.length - ext.length - 1);
        const truncated = nameWithoutExt.substring(0, maxLength - ext.length - 4);
        return `${truncated}...${ext}`;
    }

    /**
     * 파일 크기 포맷
     */
    formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
}

// CSS 스타일 추가
if (!document.getElementById('image-upload-styles')) {
    const style = document.createElement('style');
    style.id = 'image-upload-styles';
    style.textContent = `
        .upload-area {
            border: 2px dashed #d1d5db;
            border-radius: 8px;
            padding: 40px 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            background: #f9fafb;
        }

        .upload-area:hover,
        .upload-area.drag-over {
            border-color: #10b981;
            background: #ecfdf5;
        }

        .upload-icon {
            font-size: 48px;
            color: #9ca3af;
            margin-bottom: 16px;
        }

        .upload-area.drag-over .upload-icon {
            color: #10b981;
        }

        .upload-title {
            font-size: 16px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
        }

        .upload-subtitle {
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 16px;
        }

        .upload-button {
            padding: 10px 24px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
        }

        .upload-button:hover {
            background: #059669;
        }

        .preview-area {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 16px;
            margin-top: 20px;
        }

        .image-preview {
            position: relative;
            border-radius: 8px;
            overflow: hidden;
            border: 1px solid #e5e7eb;
            background: white;
        }

        .image-preview img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            display: block;
        }

        .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 50px;
            background: rgba(0, 0, 0, 0.5);
            opacity: 0;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .image-preview:hover .preview-overlay {
            opacity: 1;
        }

        .preview-remove {
            background: #ef4444;
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            color: white;
            cursor: pointer;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s;
        }

        .preview-remove:hover {
            background: #dc2626;
        }

        .preview-info {
            padding: 8px;
            background: white;
        }

        .preview-name {
            font-size: 12px;
            font-weight: 500;
            color: #374151;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 4px;
        }

        .preview-size {
            font-size: 11px;
            color: #6b7280;
        }

        @media (max-width: 640px) {
            .preview-area {
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 12px;
            }

            .image-preview img {
                height: 120px;
            }
        }
    `;
    document.head.appendChild(style);
}

// window 객체에 ImageUploader 추가
if (typeof window !== 'undefined') {
    window.ImageUploader = ImageUploader;
}
