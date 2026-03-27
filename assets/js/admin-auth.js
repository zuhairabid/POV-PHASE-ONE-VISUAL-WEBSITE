// Handle Admin Authentication
document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    // Monitor Auth State
    if (typeof auth !== 'undefined') {
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                authSection.style.display = 'none';
                dashboardSection.style.display = 'block';
                userInfo.innerText = `Logged in as: ${user.email}`;

                // Trigger admin logic
                if (typeof initAdmin === 'function') initAdmin();
            } else {
                // User is signed out
                authSection.style.display = 'flex';
                dashboardSection.style.display = 'none';
            }
        });

        // Login Logi
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            auth.signInWithEmailAndPassword(email, password)
                .then(() => {
                    loginError.style.display = 'none';
                })
                .catch((error) => {
                    loginError.innerText = error.message;
                    loginError.style.display = 'block';
                });
        });

        // Logout Logic
        logoutBtn.addEventListener('click', () => {
            auth.signOut();
        });
    }
});
