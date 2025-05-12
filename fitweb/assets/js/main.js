document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü toggle işlevi
    setupMobileMenu();
    
    // Çıkış yapma işlevi
    setupLogout();
    
    // Aktif menü öğesini işaretle
    highlightActiveMenu();
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
            navLinks.classList.toggle('show');
            navAuth.classList.toggle('show');
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
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
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            
            try {
                // API'ye çıkış yapma isteği gönder
                await apiService.logout();
                
                // Tüm localStorage verilerini temizle
                localStorage.clear();
                
                // Session storage'ı temizle
                sessionStorage.clear();
                
                // Çerezleri temizle
                document.cookie.split(";").forEach(function(c) { 
                    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
                });
                
                // Ana sayfaya yönlendir
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Çıkış yapma hatası:', error);
                // Hata olsa bile kullanıcıyı çıkış yaptır
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = 'index.html';
            }
        });
    }
}

/**
 * Aktif menü öğesini işaretler
 */
function highlightActiveMenu() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        if (currentPath.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
} 