document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü toggle işlevi
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('active');
    });

    sidebarClose.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Çıkış yapma işlevi
    const logoutBtn = document.getElementById('logoutBtn');
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Çıkış işlemleri burada yapılacak
        // localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Bildirim zili tıklama işlevi
    const notificationBell = document.querySelector('.notification-bell');
    notificationBell.addEventListener('click', () => {
        // Bildirim menüsü açılacak
        console.log('Bildirimler açıldı');
    });

    // Kullanıcı menüsü tıklama işlevi
    const userProfile = document.querySelector('.user-profile');
    userProfile.addEventListener('click', () => {
        // Kullanıcı menüsü açılacak
        console.log('Kullanıcı menüsü açıldı');
    });
}); 