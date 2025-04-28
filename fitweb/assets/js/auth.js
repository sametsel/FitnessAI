// API Servisini import et
import { apiService } from '../../src/services/api.js';

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
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Giriş butonunu devre dışı bırak ve yükleniyor göster
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
            
            // Hata mesajı konteynerini temizle
            const errorContainer = document.getElementById('error-message');
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
            }
            
            const email = this.querySelector('input[name="email"]').value.trim();
            const password = this.querySelector('input[name="password"]').value;
            const rememberMe = this.querySelector('input[name="rememberMe"]').checked;

            try {
                // API servisi ile giriş yap
                const result = await apiService.login(email, password);
                
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                }

                // Başarılı mesajı göster
                if (errorContainer) {
                    errorContainer.textContent = 'Giriş başarılı, yönlendiriliyorsunuz...';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'success-message';
                }
                
                // Dashboard'a yönlendir
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                console.error('Giriş hatası:', error);
                
                // Hata mesajını göster
                if (errorContainer) {
                    errorContainer.textContent = error.message || 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'error-message';
                } else {
                    alert(error.message || 'Giriş yapılırken bir hata oluştu.');
                }
                
                // Giriş butonunu tekrar aktif et
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Kayıt formu işlemi
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Kayıt butonunu devre dışı bırak ve yükleniyor göster
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kayıt yapılıyor...';
            
            // Hata mesajı konteynerini temizle
            const errorContainer = document.getElementById('error-message');
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
            }
            
            const formData = {
                name: this.querySelector('input[name="name"]').value.trim(),
                email: this.querySelector('input[name="email"]').value.trim(),
                password: this.querySelector('input[type="password"]').value,
                confirmPassword: this.querySelector('input[name="confirmPassword"]').value
            };

            if (formData.password !== formData.confirmPassword) {
                if (errorContainer) {
                    errorContainer.textContent = 'Şifreler eşleşmiyor!';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'error-message';
                } else {
                    alert('Şifreler eşleşmiyor!');
                }
                
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
                return;
            }

            try {
                // API servisi ile kayıt ol
                const result = await apiService.register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                });
                
                // Başarılı mesajı göster
                if (errorContainer) {
                    errorContainer.textContent = 'Kayıt başarılı, yönlendiriliyorsunuz...';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'success-message';
                }
                
                // Dashboard'a yönlendir
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (error) {
                console.error('Kayıt hatası:', error);
                
                // Hata mesajını göster
                if (errorContainer) {
                    errorContainer.textContent = error.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'error-message';
                } else {
                    alert(error.message || 'Kayıt olurken bir hata oluştu.');
                }
                
                // Kayıt butonunu tekrar aktif et
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }

    // Token kontrolü
    const token = localStorage.getItem('@fitapp_token');
    if (token) {
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    }
}); 