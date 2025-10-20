// Shopping Cart Management for Thai Exotic Plants

const Cart = {
    // Get cart items
    getItems: () => {
        return Storage.get('cart') || [];
    },

    // Add item to cart
    addItem: (productId, quantity = 1) => {
        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) {
            Utils.showToast('상품을 찾을 수 없습니다.', 'error');
            return false;
        }

        if (product.stock_quantity < quantity) {
            Utils.showToast('재고가 부족합니다.', 'error');
            return false;
        }

        const cart = Cart.getItems();
        const existingItem = cart.find(item => item.product_id === productId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                product_id: productId,
                quantity: quantity,
                added_at: new Date().toISOString()
            });
        }

        Storage.set('cart', cart);
        Cart.updateCartCount();
        Utils.showToast('장바구니에 추가되었습니다.', 'success');
        return true;
    },

    // Remove item from cart
    removeItem: (productId) => {
        let cart = Cart.getItems();
        cart = cart.filter(item => item.product_id !== productId);
        Storage.set('cart', cart);
        Cart.updateCartCount();
        Cart.displayCartItems();
        Utils.showToast('장바구니에서 제거되었습니다.', 'info');
    },

    // Update item quantity
    updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
            Cart.removeItem(productId);
            return;
        }

        const products = Storage.get('products') || [];
        const product = products.find(p => p.id === productId);
        
        if (!product) return;

        if (product.stock_quantity < quantity) {
            Utils.showToast('재고가 부족합니다.', 'error');
            return;
        }

        const cart = Cart.getItems();
        const item = cart.find(item => item.product_id === productId);
        
        if (item) {
            item.quantity = quantity;
            Storage.set('cart', cart);
            Cart.updateCartCount();
            Cart.displayCartItems();
        }
    },

    // Clear cart
    clearCart: () => {
        Storage.set('cart', []);
        Cart.updateCartCount();
        Cart.displayCartItems();
    },

    // Get cart total
    getTotal: () => {
        const cart = Cart.getItems();
        const products = Storage.get('products') || [];
        
        return cart.reduce((total, item) => {
            const product = products.find(p => p.id === item.product_id);
            return total + (product ? product.price * item.quantity : 0);
        }, 0);
    },

    // Update cart count badge
    updateCartCount: () => {
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const cart = Cart.getItems();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    },

    // Display cart items in modal
    displayCartItems: () => {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;

        const cart = Cart.getItems();
        const products = Storage.get('products') || [];

        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-shopping-cart text-5xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">장바구니가 비어있습니다.</p>
                </div>
            `;
            cartTotal.textContent = '0 THB';
            return;
        }

        cartItems.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.product_id);
            if (!product) return '';

            const itemTotal = product.price * item.quantity;

            return `
                <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <img src="${product.images[0] || 'https://via.placeholder.com/100'}" 
                         alt="${product.korean_name}"
                         class="w-20 h-20 object-cover rounded">
                    <div class="flex-1">
                        <h4 class="font-bold">${product.korean_name}</h4>
                        <p class="text-sm text-gray-600">${product.name}</p>
                        <p class="text-green-600 font-semibold">${Utils.formatCurrency(product.price)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onclick="Cart.updateQuantity('${product.id}', ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="px-3">${item.quantity}</span>
                        <button class="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                onclick="Cart.updateQuantity('${product.id}', ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="text-right">
                        <p class="font-bold">${Utils.formatCurrency(itemTotal)}</p>
                        <button class="text-red-500 hover:text-red-700 text-sm"
                                onclick="Cart.removeItem('${product.id}')">
                            <i class="fas fa-trash"></i> 삭제
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        cartTotal.textContent = Utils.formatCurrency(Cart.getTotal());
    },

    // Show cart modal
    showCart: () => {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            Cart.displayCartItems();
            modal.classList.remove('hidden');
        }
    },

    // Hide cart modal
    hideCart: () => {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    },

    // Checkout
    checkout: () => {
        const cart = Cart.getItems();
        
        if (cart.length === 0) {
            Utils.showToast('장바구니가 비어있습니다.', 'error');
            return;
        }

        // Create checkout form
        Cart.hideCart();
        Cart.showCheckoutForm();
    },

    // Show checkout form
    showCheckoutForm: () => {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;

        const cart = Cart.getItems();
        const products = Storage.get('products') || [];
        const total = Cart.getTotal();

        modal.querySelector('.bg-white').innerHTML = `
            <div class="p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold">주문하기</h2>
                    <button onclick="Cart.hideCart()" class="text-gray-500 hover:text-gray-700">
                        <i class="fas fa-times text-2xl"></i>
                    </button>
                </div>

                <!-- Order Summary -->
                <div class="mb-6 bg-gray-50 p-4 rounded-lg">
                    <h3 class="font-bold mb-3">주문 상품</h3>
                    ${cart.map(item => {
                        const product = products.find(p => p.id === item.product_id);
                        if (!product) return '';
                        return `
                            <div class="flex justify-between mb-2">
                                <span>${product.korean_name} x${item.quantity}</span>
                                <span>${Utils.formatCurrency(product.price * item.quantity)}</span>
                            </div>
                        `;
                    }).join('')}
                    <div class="border-t pt-2 mt-2">
                        <div class="flex justify-between font-bold">
                            <span>총 금액:</span>
                            <span class="text-green-600">${Utils.formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                <!-- Customer Info Form -->
                <form id="checkout-form" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-2">이름 *</label>
                        <input type="text" name="customer_name" required
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">이메일 *</label>
                        <input type="email" name="customer_email" required
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">전화번호 *</label>
                        <input type="tel" name="customer_phone" required
                               class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">배송 주소 *</label>
                        <textarea name="shipping_address" required rows="3"
                                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-2">메모</label>
                        <textarea name="notes" rows="2"
                                  class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                    </div>
                    <div class="flex space-x-4">
                        <button type="button" onclick="Cart.showCart()"
                                class="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition">
                            <i class="fas fa-arrow-left mr-2"></i>뒤로가기
                        </button>
                        <button type="submit"
                                class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-bold">
                            <i class="fas fa-check mr-2"></i>주문 완료
                        </button>
                    </div>
                </form>
            </div>
        `;

        modal.classList.remove('hidden');

        // Handle form submission
        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();
            Cart.processOrder(new FormData(e.target));
        });
    },

    // Process order
    processOrder: (formData) => {
        const cart = Cart.getItems();
        const products = Storage.get('products') || [];
        
        // Create order
        const order = {
            id: Utils.generateId(),
            order_number: 'ORD-' + Date.now(),
            customer_name: formData.get('customer_name'),
            customer_email: formData.get('customer_email'),
            customer_phone: formData.get('customer_phone'),
            shipping_address: formData.get('shipping_address'),
            notes: formData.get('notes'),
            items: cart.map(item => {
                const product = products.find(p => p.id === item.product_id);
                return {
                    product_id: item.product_id,
                    product_name: product ? product.korean_name : '',
                    quantity: item.quantity,
                    price: product ? product.price : 0
                };
            }),
            total_amount: Cart.getTotal(),
            payment_status: 'pending',
            order_status: 'new',
            created_at: new Date().toISOString()
        };

        // Save order
        const orders = Storage.get('orders') || [];
        orders.push(order);
        Storage.set('orders', orders);

        // Update product stock
        cart.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            if (product) {
                product.stock_quantity -= item.quantity;
            }
        });
        Storage.set('products', products);

        // Clear cart
        Cart.clearCart();

        // Show success message
        Cart.hideCart();
        Utils.showToast('주문이 완료되었습니다!', 'success');

        // Show order confirmation
        Cart.showOrderConfirmation(order);
    },

    // Show order confirmation
    showOrderConfirmation: (order) => {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;

        modal.querySelector('.bg-white').innerHTML = `
            <div class="p-6 text-center">
                <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                <h2 class="text-3xl font-bold mb-4">주문 완료!</h2>
                <p class="text-gray-600 mb-6">주문이 성공적으로 접수되었습니다.</p>
                <div class="bg-gray-50 p-4 rounded-lg mb-6">
                    <p class="text-sm text-gray-600 mb-2">주문번호</p>
                    <p class="text-2xl font-bold text-green-600">${order.order_number}</p>
                </div>
                <p class="text-gray-600 mb-6">
                    입력하신 이메일로 주문 확인서가 발송됩니다.<br>
                    배송 추적 정보는 이메일로 안내해드리겠습니다.
                </p>
                <button onclick="Cart.hideCart(); location.reload();"
                        class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition font-bold">
                    확인
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }
};

// Initialize cart
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateCartCount();

    // Cart button click
    const cartBtn = document.getElementById('cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', Cart.showCart);
    }

    // Close cart button
    const closeCart = document.getElementById('close-cart');
    if (closeCart) {
        closeCart.addEventListener('click', Cart.hideCart);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', Cart.checkout);
    }

    // Close modal on backdrop click
    const cartModal = document.getElementById('cart-modal');
    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                Cart.hideCart();
            }
        });
    }
});

// Export Cart object
window.Cart = Cart;
