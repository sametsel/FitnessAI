// API Servisini import et
import { apiService } from '../../src/services/api.js';
import { API_URL } from './api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Şifre göster/gizle fonksiyonu
    setupPasswordToggles();
    
    // Form işlemleri
    setupLoginForm();
    setupRegisterForm();
    
    // Token kontrolü
    checkToken();
});

/**
 * Şifre göster/gizle fonksiyonunu ayarlar
 */
function setupPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });
}

/**
 * Giriş formunu ayarlar
 */
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş yapılıyor...';
            
            const errorContainer = document.getElementById('error-message');
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
            }
            
            const email = this.querySelector('input[name="email"]').value.trim();
            const password = this.querySelector('input[name="password"]').value;
            const rememberMe = this.querySelector('input[name="rememberMe"]').checked;

            try {
                const result = await apiService.login(email, password);
                
                if (result.success && result.token) {
                    // Token'ı kaydet
                    localStorage.setItem('token', result.token);
                    
                    // Kullanıcı bilgilerini kaydet
                    if (result.user) {
                        localStorage.setItem('userName', result.user.name);
                        localStorage.setItem('userData', JSON.stringify(result.user));
                    }

                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    if (errorContainer) {
                        errorContainer.textContent = 'Giriş başarılı, yönlendiriliyorsunuz...';
                        errorContainer.style.display = 'block';
                        errorContainer.className = 'success-message';
                    }
                    
                    // Yönlendirme
                    window.location.href = 'dashboard.html';
                } else {
                    throw new Error('Giriş işlemi başarısız');
                }
            } catch (error) {
                console.error('Giriş hatası:', error);
                
                if (errorContainer) {
                    errorContainer.textContent = error.message || 'Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'error-message';
                } else {
                    alert(error.message || 'Giriş yapılırken bir hata oluştu.');
                }
                
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
}

/**
 * Kayıt formunu ayarlar
 */
function setupRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kayıt yapılıyor...';
            
            const errorContainer = document.getElementById('error-message');
            if (errorContainer) {
                errorContainer.textContent = '';
                errorContainer.style.display = 'none';
            }
            
            const formData = new FormData(this);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword'),
                gender: formData.get('gender'),
                age: parseInt(formData.get('age')),
                weight: parseFloat(formData.get('weight')),
                height: parseInt(formData.get('height')),
                goal: formData.get('goal'),
                activityLevel: formData.get('activityLevel'),
                terms: formData.get('terms') === 'on'
            };

            if (userData.password !== userData.confirmPassword) {
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
                const response = await fetch(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });

                const data = await response.json();

                if (response.ok) {
                    if (errorContainer) {
                        errorContainer.textContent = 'Kayıt başarılı, yönlendiriliyorsunuz...';
                        errorContainer.style.display = 'block';
                        errorContainer.className = 'success-message';
                    }
                    
                    localStorage.setItem('token', data.token);
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    throw new Error(data.message || 'Kayıt işlemi başarısız oldu!');
                }
            } catch (error) {
                console.error('Kayıt hatası:', error);
                
                if (errorContainer) {
                    errorContainer.textContent = error.message || 'Kayıt olurken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.';
                    errorContainer.style.display = 'block';
                    errorContainer.className = 'error-message';
                } else {
                    alert(error.message || 'Kayıt olurken bir hata oluştu.');
                }
                
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
}

/**
 * Token kontrolü yapar
 */
function checkToken() {
    const token = localStorage.getItem('token');
    if (token) {
        // Token varsa ve login/register sayfalarındaysak dashboard'a yönlendir
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // Token yoksa ve korumalı sayfalardaysak login'e yönlendir
        if (window.location.pathname.includes('dashboard.html') || 
            window.location.pathname.includes('profile.html') ||
            window.location.pathname.includes('workout.html') ||
            window.location.pathname.includes('nutrition.html')) {
            window.location.href = 'login.html';
        }
    }
} 