// Authentication Module for Thai Exotic Plants
// Handles login, registration, and user session management

const Auth = {
    currentUser: null,

    // Initialize auth module
    init: async () => {
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        
        if (token) {
            try {
                // Verify token and get user info
                const response = await API.auth.getMe();
                Auth.currentUser = response.data;
                
                console.log('✅ User authenticated:', Auth.currentUser.email);
                
                // Update UI based on user role
                Auth.updateUIForUser();
                
                return true;
            } catch (error) {
                console.error('Token verification failed:', error);
                // Token is invalid, clear it
                Auth.logout();
                return false;
            }
        }
        
        return false;
    },

    // Login with email and password
    login: async (email, password) => {
        try {
            const response = await API.auth.login(email, password);
            
            if (response.success && response.data) {
                Auth.currentUser = response.data;
                
                // Store user info
                localStorage.setItem('user', JSON.stringify(response.data));
                
                console.log('✅ Login successful:', Auth.currentUser.email);
                
                return {
                    success: true,
                    user: Auth.currentUser
                };
            } else {
                throw new Error(response.message || '로그인 실패');
            }
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: error.message || '로그인에 실패했습니다.'
            };
        }
    },

    // Register new user
    register: async (userData) => {
        try {
            const response = await API.auth.register(userData);
            
            if (response.success && response.data) {
                Auth.currentUser = response.data;
                
                // Store user info
                localStorage.setItem('user', JSON.stringify(response.data));
                
                console.log('✅ Registration successful:', Auth.currentUser.email);
                
                return {
                    success: true,
                    user: Auth.currentUser
                };
            } else {
                throw new Error(response.message || '회원가입 실패');
            }
        } catch (error) {
            console.error('Registration error:', error);
            return {
                success: false,
                message: error.message || '회원가입에 실패했습니다.'
            };
        }
    },

    // Logout
    logout: async () => {
        try {
            // Call API logout endpoint
            await API.auth.logout();
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            // Clear local data
            Auth.currentUser = null;
            localStorage.removeItem('user');
            API.setToken(null);
            
            console.log('✅ Logged out successfully');
        }
    },

    // Check if user is authenticated
    isAuthenticated: () => {
        return !!API.token && !!Auth.currentUser;
    },

    // Check if user has specific role
    hasRole: (role) => {
        if (!Auth.currentUser) return false;
        return Auth.currentUser.role === role;
    },

    // Check if user has any of the specified roles
    hasAnyRole: (roles) => {
        if (!Auth.currentUser) return false;
        return roles.includes(Auth.currentUser.role);
    },

    // Get user info
    getUser: () => {
        return Auth.currentUser;
    },

    // Update user details
    updateDetails: async (details) => {
        try {
            const response = await API.auth.updateDetails(details);
            
            if (response.success && response.data) {
                Auth.currentUser = response.data;
                localStorage.setItem('user', JSON.stringify(response.data));
                
                console.log('✅ Profile updated successfully');
                
                return {
                    success: true,
                    user: Auth.currentUser
                };
            } else {
                throw new Error(response.message || '프로필 업데이트 실패');
            }
        } catch (error) {
            console.error('Update details error:', error);
            return {
                success: false,
                message: error.message || '프로필 업데이트에 실패했습니다.'
            };
        }
    },

    // Update password
    updatePassword: async (currentPassword, newPassword) => {
        try {
            const response = await API.auth.updatePassword(currentPassword, newPassword);
            
            if (response.success) {
                console.log('✅ Password updated successfully');
                
                return {
                    success: true,
                    message: '비밀번호가 성공적으로 변경되었습니다.'
                };
            } else {
                throw new Error(response.message || '비밀번호 변경 실패');
            }
        } catch (error) {
            console.error('Update password error:', error);
            return {
                success: false,
                message: error.message || '비밀번호 변경에 실패했습니다.'
            };
        }
    },

    // Redirect to appropriate page based on role
    redirectToDashboard: () => {
        if (!Auth.currentUser) {
            window.location.href = 'login.html';
            return;
        }

        const role = Auth.currentUser.role;
        
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else if (role === 'shop_owner') {
            window.location.href = 'shop-owner.html';
        } else {
            window.location.href = 'index.html';
        }
    },

    // Update UI based on user authentication
    updateUIForUser: () => {
        const navElement = document.querySelector('nav');
        if (!navElement) return;

        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');

        if (Auth.isAuthenticated()) {
            // Show user menu, hide auth buttons
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                
                // Update user name
                const userName = document.getElementById('user-name');
                if (userName) {
                    userName.textContent = Auth.currentUser.name;
                }

                // Update user role badge
                const userRole = document.getElementById('user-role');
                if (userRole) {
                    const roleNames = {
                        'admin': '관리자',
                        'shop_owner': '샵 오너',
                        'customer': '고객'
                    };
                    userRole.textContent = roleNames[Auth.currentUser.role] || '사용자';
                }
            }
        } else {
            // Show auth buttons, hide user menu
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
        }
    },

    // Require authentication (redirect to login if not authenticated)
    requireAuth: () => {
        if (!Auth.isAuthenticated()) {
            const currentUrl = window.location.href;
            localStorage.setItem('redirectAfterLogin', currentUrl);
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Require specific role (redirect if user doesn't have the role)
    requireRole: (role) => {
        if (!Auth.requireAuth()) {
            return false;
        }

        if (!Auth.hasRole(role)) {
            alert('이 페이지에 접근할 권한이 없습니다.');
            Auth.redirectToDashboard();
            return false;
        }

        return true;
    },

    // Require any of the specified roles
    requireAnyRole: (roles) => {
        if (!Auth.requireAuth()) {
            return false;
        }

        if (!Auth.hasAnyRole(roles)) {
            alert('이 페이지에 접근할 권한이 없습니다.');
            Auth.redirectToDashboard();
            return false;
        }

        return true;
    },

    // Handle redirect after login
    handleRedirectAfterLogin: () => {
        const redirectUrl = localStorage.getItem('redirectAfterLogin');
        
        if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        } else {
            Auth.redirectToDashboard();
        }
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', async () => {
    await Auth.init();
});

// Export Auth object
window.Auth = Auth;

// Show auth status in console
console.log(`
╔═══════════════════════════════════════════════════════╗
║  🔐 Thai Exotic Plants Authentication                ║
║                                                       ║
║  Status: ${(Auth.isAuthenticated() ? '✅ Authenticated' : '❌ Not authenticated').padEnd(45)}║
${Auth.currentUser ? `║  User: ${Auth.currentUser.email.padEnd(47)}║` : ''}
${Auth.currentUser ? `║  Role: ${Auth.currentUser.role.padEnd(47)}║` : ''}
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
