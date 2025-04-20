const API_BASE_URL = 'http://localhost:5000/api';

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
            
            const email = this.querySelector('input[type="email"]').value;
            const password = this.querySelector('input[type="password"]').value;
            const rememberMe = this.querySelector('input[type="checkbox"]').checked;

            console.log('Giriş denemesi:', { email, password });

            try {
                console.log('API isteği gönderiliyor...');
                const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                console.log('API yanıtı:', response.status);
                const data = await response.json();
                console.log('API verisi:', data);

                if (response.ok) {
                    console.log('Giriş başarılı, token kaydediliyor...');
                    localStorage.setItem('token', data.token);
                    if (rememberMe) {
                        localStorage.setItem('rememberMe', 'true');
                    }

                    window.location.href = '../pages/dashboard.html';
                } else {
                    throw new Error(data.message || 'Giriş başarısız');
                }
            } catch (error) {
                console.error('Giriş hatası:', error);
                alert(error.message);
            }
        });
    }

    // Kayıt formu işlemi
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                name: this.querySelector('input[name="name"]').value,
                email: this.querySelector('input[type="email"]').value,
                password: this.querySelector('input[type="password"]').value,
                confirmPassword: this.querySelector('input[name="confirmPassword"]').value
            };

            console.log('Kayıt denemesi:', formData);

            if (formData.password !== formData.confirmPassword) {
                alert('Şifreler eşleşmiyor!');
                return;
            }

            try {
                console.log('API isteği gönderiliyor...');
                const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password
                    })
                });

                console.log('API yanıtı:', response.status);
                const data = await response.json();
                console.log('API verisi:', data);

                if (response.ok) {
                    console.log('Kayıt başarılı, token kaydediliyor...');
                    localStorage.setItem('token', data.token);
                    window.location.href = '../pages/dashboard.html';
                } else {
                    throw new Error(data.message || 'Kayıt başarısız');
                }
            } catch (error) {
                console.error('Kayıt hatası:', error);
                alert(error.message);
            }
        });
    }

    // Token kontrolü
    const token = localStorage.getItem('token');
    if (token) {
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
            window.location.href = '../pages/dashboard.html';
        }
    }
}); 