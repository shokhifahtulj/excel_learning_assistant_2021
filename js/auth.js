// js/auth.js

const AuthService = {
    // Credentials database simulation
    users: {
        admin: { username: 'admin', password: 'admin123', role: 'admin', name: 'Admin Master' },
        siswa: { username: 'siswa', password: 'siswa123', role: 'siswa', name: 'Siswa Excel' }
    },
    
    // Session expiration in milliseconds (e.g., 24 hours)
    SESSION_DURATION: 24 * 60 * 60 * 1000,

    login(username, password) {
        const user = this.users[username];
        if (user && user.password === password) {
            localStorage.setItem('user', JSON.stringify({
                username: user.username,
                role: user.role,
                name: user.name,
                loginTime: Date.now()
            }));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('user');
        window.location.replace(this.getBasePath() + 'index.html');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        
        try {
            const user = JSON.parse(userStr);
            
            // STRICT MIGRATION & VALIDATION
            if (!user.username || !user.role || !user.name || !user.loginTime) {
                console.warn('[AuthService] Invalid user session structure detected. Force logging out.', user);
                this.logout();
                return null;
            }

            // Check session expiration
            if (Date.now() - user.loginTime > this.SESSION_DURATION) {
                console.warn('[AuthService] Session expired. Force logging out.');
                this.logout();
                return null;
            }
            
            console.log('[AuthService] Valid user session loaded:', user);
            return user;
        } catch (e) {
            console.error('[AuthService] Error parsing session string. Force logging out.', e);
            this.logout();
            return null;
        }
    },

    isAuthenticated() {
        return this.getCurrentUser() !== null;
    },

    getRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    },

    getBasePath() {
        // Simple logic to find relative path depth
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../';
        }
        return './';
    },

    protectRoute() {
        const path = window.location.pathname;
        const isLoginPage = path.endsWith('index.html') || path.endsWith('/') || (!path.includes('.html') && !path.includes('/pages/'));
        const user = this.getCurrentUser();

        if (isLoginPage) {
            if (user) {
                // redirect to dashboard
                const redirectPath = user.role === 'admin' ? this.getBasePath() + 'pages/admin-dashboard.html' : this.getBasePath() + 'pages/student-dashboard.html';
                window.location.replace(redirectPath);
            }
        } else {
            // we are in a protected page (e.g. /pages/)
            if (!user) {
                window.location.replace(this.getBasePath() + 'index.html');
                return;
            }

            // Role-based protection
            if (user.role === 'siswa' && path.includes('admin')) {
                // siswa trying to access admin page
                window.location.replace(this.getBasePath() + 'pages/student-dashboard.html');
            } else if (user.role === 'admin' && path.includes('student')) {
                // admin trying to access siswa page
                window.location.replace(this.getBasePath() + 'pages/admin-dashboard.html');
            }
        }
    }
};

// Expose to window for global access
window.AuthService = AuthService;

// Run route protection automatically
AuthService.protectRoute();
