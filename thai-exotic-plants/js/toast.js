/**
 * Toast Notification System
 * 사용자에게 피드백을 제공하는 경량 알림 시스템
 * 
 * 사용 예시:
 * Toast.success('저장되었습니다');
 * Toast.error('오류가 발생했습니다');
 * Toast.warning('주의하세요');
 * Toast.info('정보를 확인하세요');
 */

const Toast = {
    // 설정
    config: {
        duration: 3000,           // 기본 표시 시간 (ms)
        position: 'top-right',    // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
        maxToasts: 5,             // 최대 동시 표시 개수
        pauseOnHover: true,       // 마우스 오버 시 타이머 일시정지
        showProgress: true,       // 진행바 표시
        closeButton: true         // 닫기 버튼 표시
    },

    // 활성 Toast 목록
    activeToasts: [],

    // Toast 컨테이너 초기화
    init() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = `toast-container toast-${this.config.position}`;
            document.body.appendChild(container);
        }
    },

    /**
     * Toast 표시
     * @param {Object} options - Toast 옵션
     */
    show(options) {
        this.init();

        const defaults = {
            type: 'info',              // success, error, warning, info
            message: '',
            title: '',
            duration: this.config.duration,
            icon: this._getIcon(options.type || 'info'),
            onClick: null,
            onClose: null,
            action: null               // { text: '실행', callback: function }
        };

        const settings = { ...defaults, ...options };

        // 최대 개수 체크
        if (this.activeToasts.length >= this.config.maxToasts) {
            this.activeToasts[0].remove();
        }

        // Toast 생성
        const toast = this._createToast(settings);
        this.activeToasts.push(toast);

        // 컨테이너에 추가
        const container = document.getElementById('toast-container');
        container.appendChild(toast.element);

        // 애니메이션
        setTimeout(() => {
            toast.element.classList.add('toast-show');
        }, 10);

        // 자동 닫기 타이머
        if (settings.duration > 0) {
            toast.startTimer(settings.duration);
        }

        return toast;
    },

    /**
     * 성공 Toast
     */
    success(message, title = '성공', options = {}) {
        return this.show({
            type: 'success',
            message,
            title,
            ...options
        });
    },

    /**
     * 에러 Toast
     */
    error(message, title = '오류', options = {}) {
        return this.show({
            type: 'error',
            message,
            title,
            duration: 5000, // 에러는 좀 더 오래 표시
            ...options
        });
    },

    /**
     * 경고 Toast
     */
    warning(message, title = '경고', options = {}) {
        return this.show({
            type: 'warning',
            message,
            title,
            ...options
        });
    },

    /**
     * 정보 Toast
     */
    info(message, title = '알림', options = {}) {
        return this.show({
            type: 'info',
            message,
            title,
            ...options
        });
    },

    /**
     * 로딩 Toast (자동으로 닫히지 않음)
     */
    loading(message, title = '처리 중') {
        return this.show({
            type: 'info',
            message,
            title,
            duration: 0, // 자동으로 닫히지 않음
            icon: '<i class="fas fa-spinner fa-spin"></i>'
        });
    },

    /**
     * Toast 생성
     */
    _createToast(settings) {
        const toast = {
            id: Date.now() + Math.random(),
            element: null,
            timer: null,
            remainingTime: settings.duration,
            startTime: null,

            // 타이머 시작
            startTimer(duration) {
                this.startTime = Date.now();
                this.remainingTime = duration;
                
                this.timer = setTimeout(() => {
                    this.remove();
                }, duration);

                if (Toast.config.showProgress) {
                    this.updateProgress(duration);
                }
            },

            // 타이머 일시정지
            pauseTimer() {
                if (this.timer) {
                    clearTimeout(this.timer);
                    this.remainingTime -= Date.now() - this.startTime;
                }
            },

            // 타이머 재개
            resumeTimer() {
                if (this.remainingTime > 0) {
                    this.startTimer(this.remainingTime);
                }
            },

            // 진행바 업데이트
            updateProgress(duration) {
                const progressBar = this.element.querySelector('.toast-progress');
                if (progressBar) {
                    progressBar.style.transition = `width ${duration}ms linear`;
                    setTimeout(() => {
                        progressBar.style.width = '0%';
                    }, 10);
                }
            },

            // Toast 제거
            remove() {
                if (this.timer) {
                    clearTimeout(this.timer);
                }

                this.element.classList.remove('toast-show');
                this.element.classList.add('toast-hide');

                setTimeout(() => {
                    if (this.element.parentNode) {
                        this.element.parentNode.removeChild(this.element);
                    }
                    
                    const index = Toast.activeToasts.indexOf(this);
                    if (index > -1) {
                        Toast.activeToasts.splice(index, 1);
                    }

                    if (settings.onClose) {
                        settings.onClose();
                    }
                }, 300);
            }
        };

        // Toast HTML 생성
        const toastEl = document.createElement('div');
        toastEl.className = `toast toast-${settings.type}`;
        toastEl.innerHTML = `
            <div class="toast-content">
                <div class="toast-icon">${settings.icon}</div>
                <div class="toast-body">
                    ${settings.title ? `<div class="toast-title">${settings.title}</div>` : ''}
                    <div class="toast-message">${settings.message}</div>
                    ${settings.action ? `
                        <button class="toast-action-btn" onclick="this.closest('.toast').__action()">
                            ${settings.action.text}
                        </button>
                    ` : ''}
                </div>
                ${Toast.config.closeButton ? `
                    <button class="toast-close" aria-label="닫기">
                        <i class="fas fa-times"></i>
                    </button>
                ` : ''}
            </div>
            ${Toast.config.showProgress && settings.duration > 0 ? `
                <div class="toast-progress"></div>
            ` : ''}
        `;

        toast.element = toastEl;

        // 닫기 버튼 이벤트
        const closeBtn = toastEl.querySelector('.toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toast.remove();
            });
        }

        // Toast 클릭 이벤트
        if (settings.onClick) {
            toastEl.style.cursor = 'pointer';
            toastEl.addEventListener('click', settings.onClick);
        }

        // 액션 버튼 이벤트
        if (settings.action) {
            toastEl.__action = () => {
                settings.action.callback();
                toast.remove();
            };
        }

        // 마우스 오버 시 일시정지
        if (Toast.config.pauseOnHover) {
            toastEl.addEventListener('mouseenter', () => {
                toast.pauseTimer();
            });
            toastEl.addEventListener('mouseleave', () => {
                toast.resumeTimer();
            });
        }

        return toast;
    },

    /**
     * 타입별 아이콘 반환
     */
    _getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    },

    /**
     * 모든 Toast 제거
     */
    clear() {
        this.activeToasts.forEach(toast => {
            toast.remove();
        });
        this.activeToasts = [];
    },

    /**
     * 설정 변경
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
};

// Promise 래퍼 (async/await 사용 가능)
Toast.promise = function(promise, messages) {
    const loadingToast = Toast.loading(messages.loading || '처리 중...');
    
    return promise
        .then(result => {
            loadingToast.remove();
            Toast.success(messages.success || '완료되었습니다');
            return result;
        })
        .catch(error => {
            loadingToast.remove();
            Toast.error(messages.error || '오류가 발생했습니다');
            throw error;
        });
};

// CSS 스타일 추가
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        .toast-container {
            position: fixed;
            z-index: 9999;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .toast-container.toast-top-right {
            top: 20px;
            right: 20px;
        }

        .toast-container.toast-top-left {
            top: 20px;
            left: 20px;
        }

        .toast-container.toast-bottom-right {
            bottom: 20px;
            right: 20px;
        }

        .toast-container.toast-bottom-left {
            bottom: 20px;
            left: 20px;
        }

        .toast-container.toast-top-center {
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
        }

        .toast-container.toast-bottom-center {
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
        }

        .toast {
            pointer-events: auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 300px;
            max-width: 500px;
            overflow: hidden;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        }

        .toast.toast-show {
            opacity: 1;
            transform: translateX(0);
        }

        .toast.toast-hide {
            opacity: 0;
            transform: translateX(100%);
        }

        .toast-content {
            display: flex;
            align-items: flex-start;
            padding: 16px;
            gap: 12px;
        }

        .toast-icon {
            font-size: 24px;
            flex-shrink: 0;
        }

        .toast-success .toast-icon {
            color: #10b981;
        }

        .toast-error .toast-icon {
            color: #ef4444;
        }

        .toast-warning .toast-icon {
            color: #f59e0b;
        }

        .toast-info .toast-icon {
            color: #3b82f6;
        }

        .toast-body {
            flex: 1;
        }

        .toast-title {
            font-weight: 600;
            font-size: 14px;
            color: #1f2937;
            margin-bottom: 4px;
        }

        .toast-message {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.5;
        }

        .toast-action-btn {
            margin-top: 8px;
            padding: 6px 12px;
            background: #f3f4f6;
            border: none;
            border-radius: 4px;
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            cursor: pointer;
            transition: background 0.2s;
        }

        .toast-action-btn:hover {
            background: #e5e7eb;
        }

        .toast-close {
            background: none;
            border: none;
            color: #9ca3af;
            cursor: pointer;
            padding: 4px;
            font-size: 16px;
            flex-shrink: 0;
            transition: color 0.2s;
        }

        .toast-close:hover {
            color: #6b7280;
        }

        .toast-progress {
            height: 4px;
            width: 100%;
            background: rgba(0, 0, 0, 0.1);
        }

        .toast-success .toast-progress {
            background: #10b981;
        }

        .toast-error .toast-progress {
            background: #ef4444;
        }

        .toast-warning .toast-progress {
            background: #f59e0b;
        }

        .toast-info .toast-progress {
            background: #3b82f6;
        }

        @media (max-width: 640px) {
            .toast-container {
                left: 10px !important;
                right: 10px !important;
                transform: none !important;
            }

            .toast {
                min-width: unset;
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// window 객체에 Toast 추가
if (typeof window !== 'undefined') {
    window.Toast = Toast;
}
