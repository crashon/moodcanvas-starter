// Social Media Automation for Thai Exotic Plants

const SocialMediaManager = {
    platforms: ['facebook', 'instagram', 'twitter'],
    
    // Generate post content from product
    generatePostContent: (product, platform) => {
        const hashtags = SocialMediaManager.generateHashtags(product);
        
        let content = '';
        
        switch (platform) {
            case 'facebook':
                content = `🌿 ${product.korean_name} (${product.name})\n\n`;
                content += `${product.description}\n\n`;
                content += `💰 가격: ${Utils.formatCurrency(product.price)}\n`;
                content += `📦 재고: ${product.stock_quantity}개\n\n`;
                content += `지금 바로 구매하세요!\n\n`;
                content += hashtags.join(' ');
                break;
                
            case 'instagram':
                content = `🌱 ${product.korean_name}\n`;
                content += `${product.name}\n\n`;
                content += `${product.description}\n\n`;
                content += `💵 ${Utils.formatCurrency(product.price)}\n\n`;
                content += hashtags.join(' ');
                break;
                
            case 'twitter':
                content = `🌿 ${product.korean_name}\n`;
                content += `${product.description.substring(0, 100)}...\n\n`;
                content += `${Utils.formatCurrency(product.price)}\n`;
                content += hashtags.slice(0, 5).join(' ');
                break;
        }
        
        return content;
    },
    
    // Generate hashtags
    generateHashtags: (product) => {
        const hashtags = [
            '#ThaiExoticPlants',
            '#희귀식물',
            '#특이식물',
            '#식물',
            '#플랜테리어',
            '#반려식물',
            '#실내식물'
        ];
        
        // Add category-specific hashtags
        const categories = Storage.get('categories') || [];
        const category = categories.find(c => c.id === product.category_id);
        if (category) {
            hashtags.push('#' + category.name.replace(/\s/g, ''));
        }
        
        // Add rare tag if applicable
        if (product.is_rare) {
            hashtags.push('#희귀종');
            hashtags.push('#레어플랜트');
        }
        
        return hashtags;
    },
    
    // Create social media post
    createPost: (productId, platforms, scheduledDate) => {
        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            Utils.showToast('상품을 찾을 수 없습니다.', 'error');
            return false;
        }
        
        const posts = Storage.get('social_posts') || [];
        
        platforms.forEach(platform => {
            const content = SocialMediaManager.generatePostContent(product, platform);
            
            const post = {
                id: Utils.generateId(),
                product_id: productId,
                platform: platform,
                content: content,
                image_url: product.images[0] || '',
                status: 'scheduled',
                scheduled_at: scheduledDate || new Date().toISOString(),
                created_at: new Date().toISOString()
            };
            
            posts.push(post);
        });
        
        Storage.set('social_posts', posts);
        Utils.showToast('소셜미디어 포스트가 예약되었습니다.', 'success');
        return true;
    },
    
    // Auto-generate posts for featured products
    autoGeneratePosts: () => {
        const products = Storage.get('products') || [];
        const featuredProducts = products.filter(p => p.is_featured && p.is_active);
        
        if (featuredProducts.length === 0) {
            Utils.showToast('추천 상품이 없습니다.', 'info');
            return;
        }
        
        let count = 0;
        featuredProducts.forEach((product, index) => {
            // Schedule posts for different times
            const scheduledDate = new Date();
            scheduledDate.setDate(scheduledDate.getDate() + index);
            scheduledDate.setHours(10, 0, 0, 0); // 10 AM
            
            if (SocialMediaManager.createPost(
                product.id,
                SocialMediaManager.platforms,
                scheduledDate.toISOString()
            )) {
                count++;
            }
        });
        
        Utils.showToast(`${count}개 상품에 대한 포스트가 생성되었습니다.`, 'success');
        
        // Reload posts if on social section
        if (typeof loadSocialPosts === 'function') {
            loadSocialPosts();
        }
    },
    
    // Publish post immediately
    publishPost: (postId) => {
        const posts = Storage.get('social_posts') || [];
        const post = posts.find(p => p.id === postId);
        
        if (!post) {
            Utils.showToast('포스트를 찾을 수 없습니다.', 'error');
            return false;
        }
        
        // In production, this would call the actual social media API
        post.status = 'published';
        post.published_at = new Date().toISOString();
        
        Storage.set('social_posts', posts);
        Utils.showToast(`${post.platform}에 포스트가 게시되었습니다.`, 'success');
        
        return true;
    },
    
    // Delete post
    deletePost: (postId) => {
        let posts = Storage.get('social_posts') || [];
        posts = posts.filter(p => p.id !== postId);
        Storage.set('social_posts', posts);
        
        Utils.showToast('포스트가 삭제되었습니다.', 'success');
        return true;
    },
    
    // Get post statistics
    getPostStats: () => {
        const posts = Storage.get('social_posts') || [];
        
        return {
            total: posts.length,
            scheduled: posts.filter(p => p.status === 'scheduled').length,
            published: posts.filter(p => p.status === 'published').length,
            byPlatform: {
                facebook: posts.filter(p => p.platform === 'facebook').length,
                instagram: posts.filter(p => p.platform === 'instagram').length,
                twitter: posts.filter(p => p.platform === 'twitter').length
            }
        };
    },
    
    // Show post preview
    showPostPreview: (productId, platform) => {
        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        const content = SocialMediaManager.generatePostContent(product, platform);
        
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full mx-4 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold">
                        <i class="fab fa-${platform}"></i> ${platform} 포스트 미리보기
                    </h3>
                    <button class="close-preview text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>
                <div class="border rounded-lg p-4 mb-4">
                    ${product.images[0] ? `
                        <img src="${product.images[0]}" class="w-full h-64 object-cover rounded mb-4">
                    ` : ''}
                    <pre class="whitespace-pre-wrap font-sans text-gray-700">${content}</pre>
                </div>
                <div class="flex space-x-4">
                    <button class="close-preview flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition">
                        닫기
                    </button>
                    <button class="confirm-post flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition">
                        예약하기
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close buttons
        modal.querySelectorAll('.close-preview').forEach(btn => {
            btn.onclick = () => modal.remove();
        });
        
        // Confirm button
        modal.querySelector('.confirm-post').onclick = () => {
            const scheduledDate = prompt('게시 날짜를 입력하세요 (YYYY-MM-DD):');
            if (scheduledDate) {
                SocialMediaManager.createPost(productId, [platform], new Date(scheduledDate).toISOString());
            }
            modal.remove();
        };
    }
};

// Export SocialMediaManager
window.SocialMediaManager = SocialMediaManager;
