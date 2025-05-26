document.addEventListener('DOMContentLoaded', function() {
    // Şifre göster/gizle fonksiyonu
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const input = this.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    });

    // Register sayfası için adım geçişleri
    const nextStepButton = document.getElementById('nextStep');
    const prevStepButton = document.getElementById('prevStep');
    const formStep1 = document.querySelector('.auth-form > div:not(.form-step-2)');
    const formStep2 = document.querySelector('.form-step-2');

    if (nextStepButton) {
        nextStepButton.addEventListener('click', function() {
            // Form validasyonu
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            if (!name || !email || !password || !confirmPassword) {
                alert('Lütfen tüm alanları doldurunuz.');
                return;
            }

            if (password !== confirmPassword) {
                alert('Şifreler eşleşmiyor.');
                return;
            }

            if (password.length < 6) {
                alert('Şifre en az 6 karakter olmalıdır.');
                return;
            }

            // Email formatı kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Geçerli bir e-posta adresi giriniz.');
                return;
            }

            // Adım 2'ye geç
            formStep1.style.display = 'none';
            formStep2.style.display = 'block';
        });
    }

    if (prevStepButton) {
        prevStepButton.addEventListener('click', function() {
            formStep2.style.display = 'none';
            formStep1.style.display = 'block';
        });
    }

    // Register butonu
    const registerButton = document.getElementById('register');
    if (registerButton) {
        registerButton.addEventListener('click', function() {
            // Form validasyonu
            const age = document.getElementById('age').value;
            const height = document.getElementById('height').value;
            const weight = document.getElementById('weight').value;
            const gender = document.getElementById('gender').value;
            const activityLevel = document.getElementById('activityLevel').value;
            const goals = document.getElementById('goals').value;

            if (!age || !height || !weight) {
                alert('Lütfen tüm alanları doldurunuz.');
                return;
            }

            // Yaş kontrolü
            if (age < 13 || age > 100) {
                alert('Geçerli bir yaş giriniz (13-100)');
                return;
            }

            // Boy kontrolü
            if (height < 100 || height > 250) {
                alert('Geçerli bir boy giriniz (100-250 cm)');
                return;
            }

            // Kilo kontrolü
            if (weight < 30 || weight > 300) {
                alert('Geçerli bir kilo giriniz (30-300 kg)');
                return;
            }

            // Form verilerini topla
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value,
                age: age,
                height: height,
                weight: weight,
                gender: gender,
                activityLevel: activityLevel,
                goals: goals
            };

            // API'ye gönder
            registerUser(formData);
        });
    }

    // Login butonu
    const loginButton = document.querySelector('.auth-form .btn-primary');
    if (loginButton && !registerButton) {
        loginButton.addEventListener('click', function() {
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (!email || !password) {
                alert('Lütfen tüm alanları doldurunuz.');
                return;
            }

            // Email formatı kontrolü
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Geçerli bir e-posta adresi giriniz.');
                return;
            }

            // API'ye gönder
            loginUser(email, password);
        });
    }
});

// API fonksiyonları
async function registerUser(formData) {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Başarılı kayıt
            window.location.href = '/pages/home.html';
        } else {
            // Hata mesajı
            alert(data.message || 'Kayıt işlemi başarısız oldu.');
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

async function loginUser(email, password) {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Başarılı giriş
            window.location.href = '/pages/home.html';
        } else {
            // Hata mesajı
            alert(data.message || 'Giriş işlemi başarısız oldu.');
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
} 