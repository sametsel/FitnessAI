document.addEventListener('DOMContentLoaded', function() {
    // Şifre göster/gizle fonksiyonu
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            if (input.type === 'password') {
                input.type = 'text';
                this.classList.remove('fa-eye-slash');
                this.classList.add('fa-eye');
            } else {
                input.type = 'password';
                this.classList.remove('fa-eye');
                this.classList.add('fa-eye-slash');
            }
        });
    });

    // Form gönderme işlemi
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;

            // API'ye gönderilecek veriler
            const loginData = {
                email: email,
                password: password
            };

            // API çağrısı burada yapılacak
            console.log('Giriş verileri:', loginData);
            
            // Başarılı giriş sonrası yönlendirme
            // window.location.href = 'dashboard.html';
        });
    }
}); 