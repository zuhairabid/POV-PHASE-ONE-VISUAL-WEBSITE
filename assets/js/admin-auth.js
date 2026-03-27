// Handle Admin Authentication
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    // Admin Credentials
    const ADMIN_USERNAME = 'Admin';
    const ADMIN_PASSWORD = 'Yourmom123';

    // Check if user is already logged in (via localStorage)
    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (isLoggedIn === 'true') {
            authSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            userInfo.innerText = 'Logged in as: Admin';
            if (typeof initAdmin === 'function') initAdmin();
        } else {
            authSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
        }
    };

    // Initial check
    checkLoginStatus();

    // Login Logic
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            loginError.style.display = 'none';
            authSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            userInfo.innerText = 'Logged in as: Admin';
            if (typeof initAdmin === 'function') initAdmin();
        } else {
            loginError.innerText = 'Invalid username or password';
            loginError.style.display = 'block';
        }
    });

    // Logout Logic
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('adminLoggedIn');
        authSection.style.display = 'flex';
        dashboardSection.style.display = 'none';
    });
});
