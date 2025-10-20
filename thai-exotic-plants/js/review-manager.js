// Review Manager Module for Thai Exotic Plants
// Handles review CRUD operations and display

const ReviewManager = {
    reviews: [],
    currentProductReviews: [],

    // Initialize review manager
    init: async () => {
        if (Auth.isAuthenticated()) {
            await ReviewManager.loadMyReviews();
        }
    },

    // Load reviews for a specific product
    loadProductReviews: async (productId, filters = {}) => {
        try {
            ReviewManager.currentProductReviews = await DataSource.getProductReviews(productId, filters);
            console.log(`✅ Loaded ${ReviewManager.currentProductReviews.length} reviews for product`);
            return ReviewManager.currentProductReviews;
        } catch (error) {
            console.error('Error loading product reviews:', error);
            Utils.showToast('리뷰를 불러올 수 없습니다', 'error');
            return [];
        }
    },

    // Load current user's reviews
    loadMyReviews: async (filters = {}) => {
        try {
            if (!Auth.isAuthenticated()) {
                return [];
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.getMy(filters);
                ReviewManager.reviews = response.data;
            } else {
                // LocalStorage mode
                const allReviews = Storage.get('reviews') || [];
                ReviewManager.reviews = allReviews.filter(r => r.user_id === Auth.currentUser.id);
            }

            console.log(`✅ Loaded ${ReviewManager.reviews.length} my reviews`);
            return ReviewManager.reviews;
        } catch (error) {
            console.error('Error loading my reviews:', error);
            return [];
        }
    },

    // Get review by ID
    getReviewById: async (reviewId) => {
        try {
            if (DataSource.mode === 'api') {
                const response = await API.reviews.getById(reviewId);
                return response.data;
            } else {
                const allReviews = Storage.get('reviews') || [];
                return allReviews.find(r => r.id === reviewId) || null;
            }
        } catch (error) {
            console.error('Error getting review:', error);
            return null;
        }
    },

    // Create new review
    createReview: async (reviewData) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            const result = await DataSource.createReview(reviewData);
            
            console.log('✅ Review created');
            Utils.showToast('리뷰가 성공적으로 작성되었습니다', 'success');
            
            return {
                success: true,
                review: result
            };
        } catch (error) {
            console.error('Error creating review:', error);
            Utils.showToast(error.message || '리뷰 작성에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Update review
    updateReview: async (reviewId, reviewData) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.update(reviewId, reviewData);
                
                if (response.success && response.data) {
                    console.log('✅ Review updated');
                    Utils.showToast('리뷰가 성공적으로 수정되었습니다', 'success');
                    
                    return {
                        success: true,
                        review: response.data
                    };
                } else {
                    throw new Error(response.message || '리뷰 수정 실패');
                }
            } else {
                // LocalStorage mode
                const reviews = Storage.get('reviews') || [];
                const index = reviews.findIndex(r => r.id === reviewId);
                
                if (index === -1) {
                    throw new Error('리뷰를 찾을 수 없습니다');
                }

                reviews[index] = {
                    ...reviews[index],
                    ...reviewData,
                    updatedAt: new Date().toISOString()
                };

                Storage.set('reviews', reviews);
                
                Utils.showToast('리뷰가 성공적으로 수정되었습니다 (데모 모드)', 'success');
                
                return {
                    success: true,
                    review: reviews[index]
                };
            }
        } catch (error) {
            console.error('Error updating review:', error);
            Utils.showToast(error.message || '리뷰 수정에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Delete review
    deleteReview: async (reviewId) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            // Use Modal.confirm if available
            const confirmed = window.Modal 
                ? await Modal.confirm({
                    title: '리뷰 삭제',
                    message: '정말로 이 리뷰를 삭제하시겠습니까?',
                    confirmText: '삭제',
                    confirmClass: 'bg-red-600 hover:bg-red-700'
                })
                : confirm('정말로 이 리뷰를 삭제하시겠습니까?');
            
            if (!confirmed) {
                return { success: false, cancelled: true };
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.delete(reviewId);
                
                if (response.success) {
                    console.log('✅ Review deleted');
                    Utils.showToast('리뷰가 성공적으로 삭제되었습니다', 'success');
                    
                    return { success: true };
                } else {
                    throw new Error(response.message || '리뷰 삭제 실패');
                }
            } else {
                // LocalStorage mode
                let reviews = Storage.get('reviews') || [];
                reviews = reviews.filter(r => r.id !== reviewId);
                Storage.set('reviews', reviews);
                
                Utils.showToast('리뷰가 성공적으로 삭제되었습니다 (데모 모드)', 'success');
                
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            Utils.showToast(error.message || '리뷰 삭제에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Mark review as helpful
    markHelpful: async (reviewId) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.markHelpful(reviewId);
                
                if (response.success) {
                    Utils.showToast('도움이 됨을 표시했습니다', 'success');
                    return { success: true };
                } else {
                    throw new Error(response.message || '표시 실패');
                }
            } else {
                // LocalStorage mode
                const reviews = Storage.get('reviews') || [];
                const review = reviews.find(r => r.id === reviewId);
                
                if (review) {
                    review.helpfulCount = (review.helpfulCount || 0) + 1;
                    Storage.set('reviews', reviews);
                    
                    Utils.showToast('도움이 됨을 표시했습니다 (데모 모드)', 'success');
                    return { success: true };
                }
                
                throw new Error('리뷰를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('Error marking helpful:', error);
            Utils.showToast(error.message || '표시에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Add shop owner response
    addResponse: async (reviewId, responseText) => {
        try {
            if (!Auth.isAuthenticated()) {
                throw new Error('로그인이 필요합니다');
            }

            if (!Auth.hasAnyRole(['shop_owner', 'admin'])) {
                throw new Error('샵 오너만 답변할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.addResponse(reviewId, responseText);
                
                if (response.success && response.data) {
                    console.log('✅ Response added to review');
                    Utils.showToast('답변이 성공적으로 등록되었습니다', 'success');
                    
                    return {
                        success: true,
                        review: response.data
                    };
                } else {
                    throw new Error(response.message || '답변 등록 실패');
                }
            } else {
                // LocalStorage mode
                const reviews = Storage.get('reviews') || [];
                const review = reviews.find(r => r.id === reviewId);
                
                if (review) {
                    review.shopResponse = {
                        text: responseText,
                        respondedBy: Auth.currentUser.id,
                        respondedAt: new Date().toISOString()
                    };
                    Storage.set('reviews', reviews);
                    
                    Utils.showToast('답변이 성공적으로 등록되었습니다 (데모 모드)', 'success');
                    
                    return {
                        success: true,
                        review: review
                    };
                }
                
                throw new Error('리뷰를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('Error adding response:', error);
            Utils.showToast(error.message || '답변 등록에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Update review status (Admin only)
    updateStatus: async (reviewId, status) => {
        try {
            if (!Auth.hasRole('admin')) {
                throw new Error('관리자만 리뷰 상태를 변경할 수 있습니다');
            }

            if (DataSource.mode === 'api') {
                const response = await API.reviews.updateStatus(reviewId, status);
                
                if (response.success) {
                    Utils.showToast('리뷰 상태가 변경되었습니다', 'success');
                    return { success: true };
                } else {
                    throw new Error(response.message || '상태 변경 실패');
                }
            } else {
                // LocalStorage mode
                const reviews = Storage.get('reviews') || [];
                const review = reviews.find(r => r.id === reviewId);
                
                if (review) {
                    review.status = status;
                    Storage.set('reviews', reviews);
                    
                    Utils.showToast('리뷰 상태가 변경되었습니다 (데모 모드)', 'success');
                    return { success: true };
                }
                
                throw new Error('리뷰를 찾을 수 없습니다');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Utils.showToast(error.message || '상태 변경에 실패했습니다', 'error');
            
            return {
                success: false,
                message: error.message
            };
        }
    },

    // Render review card
    renderReviewCard: (review) => {
        const stars = ReviewManager.renderStars(review.rating);
        const verifiedBadge = review.isVerifiedPurchase 
            ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"><i class="fas fa-check-circle"></i> 구매 인증</span>'
            : '';

        const statusBadge = {
            pending: '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">대기중</span>',
            approved: '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">승인됨</span>',
            rejected: '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">거부됨</span>'
        }[review.status] || '';

        const userName = review.user?.name || '익명';
        const date = new Date(review.createdAt).toLocaleDateString('ko-KR');

        const images = review.images && review.images.length > 0
            ? `<div class="flex space-x-2 mt-3">
                ${review.images.map(img => `
                    <img src="${img}" alt="Review image" class="w-20 h-20 object-cover rounded cursor-pointer hover:opacity-75" onclick="ReviewManager.showImage('${img}')">
                `).join('')}
            </div>`
            : '';

        const shopResponse = review.shopResponse
            ? `<div class="mt-3 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                <div class="flex items-center mb-2">
                    <i class="fas fa-store text-blue-600 mr-2"></i>
                    <span class="font-semibold text-blue-800">샵 오너 답변</span>
                    <span class="text-xs text-gray-600 ml-auto">${new Date(review.shopResponse.respondedAt).toLocaleDateString('ko-KR')}</span>
                </div>
                <p class="text-gray-700 text-sm">${review.shopResponse.text}</p>
            </div>`
            : '';

        const canEdit = Auth.currentUser && (review.user?.id === Auth.currentUser.id || review.user_id === Auth.currentUser.id);
        const canRespond = Auth.hasAnyRole(['shop_owner', 'admin']) && !review.shopResponse;

        return `
            <div class="review-card bg-white p-4 rounded-lg shadow-sm border">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                            ${userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div class="font-semibold">${userName}</div>
                            <div class="text-xs text-gray-500">${date}</div>
                        </div>
                    </div>
                    <div class="flex items-center space-x-2">
                        ${verifiedBadge}
                        ${Auth.hasRole('admin') ? statusBadge : ''}
                    </div>
                </div>

                <div class="mb-2">
                    ${stars}
                </div>

                ${review.title ? `<h4 class="font-semibold mb-2">${review.title}</h4>` : ''}
                
                <p class="text-gray-700 mb-3">${review.comment}</p>

                ${images}
                ${shopResponse}

                <div class="flex items-center justify-between mt-4 pt-3 border-t">
                    <div class="flex items-center space-x-4 text-sm text-gray-600">
                        <button onclick="ReviewManager.markHelpful('${review._id || review.id}')" 
                                class="flex items-center space-x-1 hover:text-green-600 transition">
                            <i class="fas fa-thumbs-up"></i>
                            <span>도움됨 (${review.helpfulCount || 0})</span>
                        </button>
                    </div>

                    ${canEdit || canRespond ? `
                        <div class="flex space-x-2">
                            ${canEdit ? `
                                <button onclick="ReviewManager.editReview('${review._id || review.id}')" 
                                        class="text-blue-600 hover:text-blue-800 text-sm">
                                    <i class="fas fa-edit mr-1"></i>수정
                                </button>
                                <button onclick="ReviewManager.deleteReview('${review._id || review.id}')" 
                                        class="text-red-600 hover:text-red-800 text-sm">
                                    <i class="fas fa-trash mr-1"></i>삭제
                                </button>
                            ` : ''}
                            ${canRespond ? `
                                <button onclick="ReviewManager.showResponseForm('${review._id || review.id}')" 
                                        class="text-green-600 hover:text-green-800 text-sm">
                                    <i class="fas fa-reply mr-1"></i>답변
                                </button>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    // Render star rating
    renderStars: (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        let html = '<div class="flex items-center">';
        
        for (let i = 0; i < fullStars; i++) {
            html += '<i class="fas fa-star text-yellow-500"></i>';
        }
        
        if (hasHalfStar) {
            html += '<i class="fas fa-star-half-alt text-yellow-500"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            html += '<i class="far fa-star text-yellow-500"></i>';
        }
        
        html += `<span class="ml-2 text-gray-600 font-medium">${rating.toFixed(1)}</span>`;
        html += '</div>';
        
        return html;
    },

    // Calculate rating statistics
    calculateRatingStats: (reviews) => {
        if (!reviews || reviews.length === 0) {
            return {
                average: 0,
                total: 0,
                distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
            };
        }

        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = sum / total;

        const distribution = {
            5: reviews.filter(r => r.rating === 5).length,
            4: reviews.filter(r => r.rating === 4).length,
            3: reviews.filter(r => r.rating === 3).length,
            2: reviews.filter(r => r.rating === 2).length,
            1: reviews.filter(r => r.rating === 1).length
        };

        return {
            average,
            total,
            distribution
        };
    },

    // Show image in modal (placeholder)
    showImage: (imageUrl) => {
        window.open(imageUrl, '_blank');
    },

    // Edit review
    editReview: async (reviewId) => {
        console.log('Edit review:', reviewId);
        
        // Load review data
        const review = await ReviewManager.getReviewById(reviewId);
        
        if (review && window.ModalTemplates) {
            ModalTemplates.showReviewModal(review.product?._id || review.product, review);
        } else {
            alert('리뷰 데이터를 불러올 수 없습니다');
        }
    },

    // Show response form
    showResponseForm: async (reviewId) => {
        if (window.Modal) {
            Modal.showForm({
                title: '샵 오너 답변',
                fields: [
                    {
                        name: 'response',
                        label: '답변 내용',
                        type: 'textarea',
                        placeholder: '리뷰에 대한 답변을 작성해주세요',
                        required: true
                    }
                ],
                submitText: '답변 등록',
                onSubmit: async (data) => {
                    const result = await ReviewManager.addResponse(reviewId, data.response);
                    if (result.success) {
                        Modal.close();
                        // Refresh reviews if exists
                        if (typeof loadReviews === 'function') {
                            loadReviews();
                        }
                    }
                }
            });
        } else {
            const responseText = prompt('답변을 입력하세요:');
            if (responseText) {
                await ReviewManager.addResponse(reviewId, responseText);
            }
        }
    }
};

// Export ReviewManager
window.ReviewManager = ReviewManager;

console.log('✅ ReviewManager module loaded');
