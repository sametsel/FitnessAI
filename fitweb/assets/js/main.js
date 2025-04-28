document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü toggle işlevi
    setupMobileMenu();
    
    // Çıkış yapma işlevi
    setupLogout();
    
    // Giriş kontrolü
    checkAuth();
});

/**
 * Mobil menü için event listener ayarlar
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navAuth = document.querySelector('.nav-auth');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            // Menüyü aç/kapat
            navLinks.classList.toggle('show');
            navAuth.classList.toggle('show');
            
            // Menü ikonunu değiştir (hamburger/çarpı)
            const icon = this.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Sayfa scroll olduğunda menüyü kapat
        window.addEventListener('scroll', function() {
            if (navLinks.classList.contains('show')) {
                navLinks.classList.remove('show');
                navAuth.classList.remove('show');
                const icon = menuToggle.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/**
 * Çıkış yapma butonu için event listener
 */
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // LocalStorage'dan kullanıcı bilgilerini temizle
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            
            // Ana sayfaya yönlendir
            window.location.href = 'index.html';
        });
    }
}

/**
 * Kullanıcı giriş durumunu kontrol et
 */
function checkAuth() {
    const token = localStorage.getItem('token');
    const authLinks = document.querySelector('.nav-auth');
    const dashboardLink = document.createElement('a');
    
    // Eğer token varsa ve ana sayfadaysak
    if (token && window.location.pathname.includes('index.html')) {
        // Kullanıcı giriş yapmış, dashboard linkini göster, giriş/kayıt butonlarını gizle
        if (authLinks) {
            authLinks.innerHTML = '';
            dashboardLink.href = 'dashboard.html';
            dashboardLink.className = 'btn btn-primary';
            dashboardLink.textContent = 'Dashboard';
            authLinks.appendChild(dashboardLink);
            
            const logoutLink = document.createElement('a');
            logoutLink.href = '#';
            logoutLink.className = 'btn btn-login';
            logoutLink.textContent = 'Çıkış Yap';
            logoutLink.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                window.location.reload();
            });
            
            authLinks.appendChild(logoutLink);
        }
    }
    // Korumalı sayfalar için güvenlik kontrolü
    else if (!token && isProtectedPage()) {
        // Kullanıcı giriş yapmamış ama korumalı sayfada, login sayfasına yönlendir
        window.location.href = 'login.html';
    }
}

/**
 * Mevcut sayfanın giriş gerektiren bir sayfa olup olmadığını kontrol eder
 */
function isProtectedPage() {
    const protectedPages = ['dashboard.html', 'workout.html', 'nutrition.html', 'profile.html'];
    const currentPath = window.location.pathname;
    
    return protectedPages.some(page => currentPath.includes(page));
}

// Karanlık mod tercihi
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Kullanıcı karanlık mod tercihini değiştirdiğinde
prefersDarkScheme.addEventListener('change', function(e) {
    // Eğer karanlık mod tercih ediliyorsa
    if (e.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
});

// Sayfa yüklendiğinde doğru modu ayarla
if (prefersDarkScheme.matches) {
    document.body.classList.add('dark-mode');
} 