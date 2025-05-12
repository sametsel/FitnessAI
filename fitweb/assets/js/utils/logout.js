import { apiService } from '../../../src/services/api.js';

export function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            try {
                await apiService.logout();
                localStorage.clear();
                sessionStorage.clear();
                document.cookie.split(';').forEach(function(c) {
                    document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
                });
                window.location.href = 'index.html';
            } catch (error) {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
} 