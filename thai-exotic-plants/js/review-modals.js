// Review Modal Functions for Thai Exotic Plants
// Modals for creating and editing reviews

const ReviewModals = {
    // Show review create modal
    showCreateReviewModal: (productId, productName = '') => {
        const content = `
            <form id="create-review-form" class="space-y-4">
                <input type="hidden" name="productId" value="${productId}">
                
                <div class="text-center mb-4">
                    <p class="text-gray-600">
                        <strong>${productName}</strong>에 대한 리뷰를 작성해주세요
                    </p>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        평점 <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center space-x-2">
                        <div class="star-rating flex space-x-1" id="star-rating">
                            ${[1, 2, 3, 4, 5].map(num => `
                                <button type="button" 
                                        data-rating="${num}"
                                        onclick="ReviewModals.setRating(${num})"
                                        class="star-btn text-3xl text-gray-300 hover:text-yellow-500 transition">
                                    <i class="far fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <span id="rating-text" class="text-gray-600 ml-4">평점을 선택하세요</span>
                    </div>
                    <input type="hidden" name="rating" id="rating-value" required>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        제목
                    </label>
                    <input type="text" 
                           name="title" 
                           placeholder="예: 정말 만족스러워요!"
                           maxlength="200"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        리뷰 내용 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="comment" 
                              required
                              placeholder="상품에 대한 솔직한 리뷰를 작성해주세요 (최소 10자)"
                              rows="6"
                              minlength="10"
                              maxlength="2000"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                    <p class="text-xs text-gray-500 mt-1">최소 10자 이상 작성해주세요</p>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        사진 첨부 (선택사항)
                    </label>
                    <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-500 transition">
                        <i class="fas fa-camera text-4xl text-gray-400 mb-2"></i>
                        <p class="text-gray-600 mb-2">이미지 URL을 입력하세요</p>
                        <input type="url" 
                               name="image1" 
                               placeholder="https://example.com/image1.jpg"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                        <input type="url" 
                               name="image2" 
                               placeholder="https://example.com/image2.jpg"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                        <input type="url" 
                               name="image3" 
                               placeholder="https://example.com/image3.jpg"
                               class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                    </div>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div class="flex items-start">
                        <i class="fas fa-info-circle text-blue-500 mt-1 mr-3"></i>
                        <div class="text-sm text-blue-800">
                            <p class="font-medium mb-1">리뷰 작성 안내</p>
                            <ul class="list-disc list-inside space-y-1 text-blue-700">
                                <li>솔직하고 구체적인 리뷰가 다른 고객들에게 큰 도움이 됩니다</li>
                                <li>구매하신 상품에 대한 경험을 공유해주세요</li>
                                <li>비방이나 욕설은 삭제될 수 있습니다</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="flex space-x-4 pt-4">
                    <button type="button" 
                            onclick="Modal.close()" 
                            class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                        취소
                    </button>
                    <button type="submit" 
                            class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                        <i class="fas fa-check mr-2"></i>리뷰 작성
                    </button>
                </div>
            </form>
        `;

        Modal.show({
            title: '리뷰 작성',
            content: content,
            size: 'large',
            closeOnOverlay: false
        });

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('create-review-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await ReviewModals.handleCreateReview(new FormData(form));
                });
            }
        }, 100);
    },

    // Set rating
    setRating: (rating) => {
        document.getElementById('rating-value').value = rating;
        
        // Update stars display
        const stars = document.querySelectorAll('.star-btn');
        stars.forEach((star, index) => {
            const icon = star.querySelector('i');
            if (index < rating) {
                icon.classList.remove('far', 'text-gray-300');
                icon.classList.add('fas', 'text-yellow-500');
            } else {
                icon.classList.remove('fas', 'text-yellow-500');
                icon.classList.add('far', 'text-gray-300');
            }
        });

        // Update text
        const texts = ['', '별로예요', '그저 그래요', '좋아요', '정말 좋아요', '최고예요!'];
        document.getElementById('rating-text').textContent = texts[rating];
    },

    // Handle review creation
    handleCreateReview: async (formData) => {
        const rating = parseInt(formData.get('rating'));
        
        if (!rating || rating < 1 || rating > 5) {
            Utils.showToast('평점을 선택해주세요', 'error');
            return;
        }

        const images = [];
        ['image1', 'image2', 'image3'].forEach(key => {
            const url = formData.get(key);
            if (url && url.trim()) {
                images.push(url.trim());
            }
        });

        const reviewData = {
            product: formData.get('productId'),
            rating: rating,
            title: formData.get('title') || undefined,
            comment: formData.get('comment'),
            images: images.length > 0 ? images : undefined
        };

        const result = await ReviewManager.createReview(reviewData);

        if (result.success) {
            Modal.close();
            
            // Reload reviews if on product page
            if (typeof loadProductReviews === 'function') {
                loadProductReviews();
            }
        }
    },

    // Show review edit modal
    showEditReviewModal: async (reviewId) => {
        // Load review data
        const review = await ReviewManager.getReviewById(reviewId);
        if (!review) {
            Utils.showToast('리뷰를 찾을 수 없습니다', 'error');
            return;
        }

        const content = `
            <form id="edit-review-form" class="space-y-4">
                <input type="hidden" name="reviewId" value="${reviewId}">
                
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        평점 <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center space-x-2">
                        <div class="star-rating flex space-x-1" id="star-rating">
                            ${[1, 2, 3, 4, 5].map(num => `
                                <button type="button" 
                                        data-rating="${num}"
                                        onclick="ReviewModals.setRating(${num})"
                                        class="star-btn text-3xl ${num <= review.rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition">
                                    <i class="${num <= review.rating ? 'fas' : 'far'} fa-star"></i>
                                </button>
                            `).join('')}
                        </div>
                        <span id="rating-text" class="text-gray-600 ml-4"></span>
                    </div>
                    <input type="hidden" name="rating" id="rating-value" value="${review.rating}" required>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        제목
                    </label>
                    <input type="text" 
                           name="title" 
                           value="${review.title || ''}"
                           maxlength="200"
                           class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        리뷰 내용 <span class="text-red-500">*</span>
                    </label>
                    <textarea name="comment" 
                              required
                              rows="6"
                              minlength="10"
                              maxlength="2000"
                              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent">${review.comment || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        사진 첨부
                    </label>
                    <input type="url" 
                           name="image1" 
                           value="${review.images && review.images[0] ? review.images[0] : ''}"
                           placeholder="https://example.com/image1.jpg"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                    <input type="url" 
                           name="image2" 
                           value="${review.images && review.images[1] ? review.images[1] : ''}"
                           placeholder="https://example.com/image2.jpg"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2">
                    <input type="url" 
                           name="image3" 
                           value="${review.images && review.images[2] ? review.images[2] : ''}"
                           placeholder="https://example.com/image3.jpg"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg">
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
            title: '리뷰 수정',
            content: content,
            size: 'large',
            closeOnOverlay: false
        });

        // Set initial rating text
        setTimeout(() => {
            ReviewModals.setRating(review.rating);
        }, 100);

        // Handle form submission
        setTimeout(() => {
            const form = document.getElementById('edit-review-form');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await ReviewModals.handleEditReview(new FormData(form));
                });
            }
        }, 100);
    },

    // Handle review editing
    handleEditReview: async (formData) => {
        const reviewId = formData.get('reviewId');
        const rating = parseInt(formData.get('rating'));
        
        if (!rating || rating < 1 || rating > 5) {
            Utils.showToast('평점을 선택해주세요', 'error');
            return;
        }

        const images = [];
        ['image1', 'image2', 'image3'].forEach(key => {
            const url = formData.get(key);
            if (url && url.trim()) {
                images.push(url.trim());
            }
        });

        const reviewData = {
            rating: rating,
            title: formData.get('title') || undefined,
            comment: formData.get('comment'),
            images: images.length > 0 ? images : undefined
        };

        const result = await ReviewManager.updateReview(reviewId, reviewData);

        if (result.success) {
            Modal.close();
            
            // Reload reviews if on product page
            if (typeof loadProductReviews === 'function') {
                loadProductReviews();
            }
        }
    }
};

// Export ReviewModals
window.ReviewModals = ReviewModals;

// Override ReviewManager methods (wait for ReviewManager to be loaded)
document.addEventListener('DOMContentLoaded', () => {
    if (window.ReviewManager) {
        // Override ReviewManager.editReview to use modal
        ReviewManager.editReview = (reviewId) => {
            ReviewModals.showEditReviewModal(reviewId);
        };

        // Override ReviewManager.showResponseForm
        ReviewManager.showResponseForm = async (reviewId) => {
    const content = `
        <form id="response-form" class="space-y-4">
            <div class="form-group">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    답변 내용 <span class="text-red-500">*</span>
                </label>
                <textarea name="response" 
                          required
                          placeholder="고객의 리뷰에 대한 답변을 작성해주세요"
                          rows="6"
                          minlength="5"
                          maxlength="1000"
                          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"></textarea>
                <p class="text-xs text-gray-500 mt-1">정중하고 도움이 되는 답변을 작성해주세요</p>
            </div>

            <div class="flex space-x-4 pt-4">
                <button type="button" 
                        onclick="Modal.close()" 
                        class="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">
                    취소
                </button>
                <button type="submit" 
                        class="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition">
                    <i class="fas fa-reply mr-2"></i>답변 등록
                </button>
            </div>
        </form>
    `;

    Modal.show({
        title: '샵 오너 답변',
        content: content,
        size: 'medium',
        closeOnOverlay: false
    });

    setTimeout(() => {
        const form = document.getElementById('response-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const response = new FormData(form).get('response');
                const result = await ReviewManager.addResponse(reviewId, response);
                if (result.success) {
                    Modal.close();
                    if (typeof loadProductReviews === 'function') {
                        loadProductReviews();
                    }
                }
            });
        }
    }, 100);
        };
    }
});

console.log('✅ Review Modals loaded');
