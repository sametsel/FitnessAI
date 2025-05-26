document.addEventListener('DOMContentLoaded', () => {
    // Sayfa yüklendiğinde çalışacak kodlar
    console.log('FitApp web uygulaması başlatıldı');

    // Giriş ve kayıt butonlarına tıklama olaylarını ekle
    const loginBtn = document.querySelector('a[href="pages/login.html"]');
    const registerBtn = document.querySelector('a[href="pages/register.html"]');

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('pages/login.html');
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage('pages/register.html');
        });
    }

    // Menü öğelerini aktif hale getir
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Sayfa yüklendiğinde animasyonları başlat
    initializeAnimations();
    setupScrollAnimations();

    // Örnek öğün verisi
    const exampleMeals = [
       
    ];
    updateMealsAndCalories(exampleMeals);

    
});

// Animasyonları başlat
function initializeAnimations() {
    // Sayfa geçiş efekti
    document.body.classList.add('page-transition');
    
    // İstatistik kartlarını sırayla göster
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Logo animasyonu
    const logo = document.querySelector('.logo-circle');
    if (logo) {
        logo.classList.add('pulse');
    }
}

// Scroll animasyonları
function setupScrollAnimations() {
    const elements = document.querySelectorAll('.card, .exercise-item, .meal-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Yükleme efekti
function showLoading(element) {
    element.classList.add('loading');
}

function hideLoading(element) {
    element.classList.remove('loading');
}

// Modal animasyonları
function showModal(modal) {
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.opacity = '1';
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }, 10);
}

function hideModal(modal) {
    modal.style.opacity = '0';
    modal.querySelector('.modal-content').style.transform = 'translateY(-20px)';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Buton tıklama efekti
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        this.appendChild(ripple);
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${e.clientX - rect.left - size/2}px`;
        ripple.style.top = `${e.clientY - rect.top - size/2}px`;
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Form gönderimi animasyonu
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        const submitButton = this.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.classList.add('loading');
            setTimeout(() => {
                submitButton.classList.remove('loading');
            }, 1000);
        }
    });
});

// Sayfa geçiş animasyonu
function navigateToPage(url) {
    document.body.style.opacity = '0';
    setTimeout(() => {
        window.location.href = url;
    }, 300);
}

// Kart geçiş animasyonlarını uygula
function updateCardTransitions(containerSelector = '.card') {
    const cards = document.querySelectorAll(containerSelector);
    cards.forEach((card, idx) => {
        card.classList.add('card-enter');
        setTimeout(() => {
            card.classList.add('card-enter-active');
        }, 10 + idx * 60);
        setTimeout(() => {
            card.classList.remove('card-enter', 'card-enter-active');
        }, 600 + idx * 60);
    });
}

// Kartlar güncellendiğinde bu fonksiyonu çağırın
// Örneğin bir filtre veya liste güncellemesinden sonra:
// updateCardTransitions('.card'); 

// API istekleri için yardımcı fonksiyonlar
async function handleApiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`http://localhost:3000/api${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Hatası:', error);
        throw error;
    }
}

// Buton tıklama olaylarını ekle
document.querySelectorAll('.pro-btn').forEach(button => {
    button.addEventListener('click', async function(e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        
        try {
            // Buton tıklama animasyonu
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 200);

            // Sayfa geçişi
            if (href) {
                navigateToPage(href);
            }
        } catch (error) {
            console.error('İşlem sırasında hata:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
});

// Öğünleri ve toplam kaloriyi güncelle
function updateMealsAndCalories(meals) {
    const mealsList = document.getElementById('mealsList');
    const totalCaloriesElem = document.getElementById('totalCalories');
    if (!mealsList || !totalCaloriesElem) return;

    if (!meals || meals.length === 0) {
        mealsList.innerHTML = '<li>Henüz öğün kaydı yok</li>';
        totalCaloriesElem.textContent = '0 kcal';
        return;
    }

    let totalCalories = 0;
    mealsList.innerHTML = meals.map(meal => {
        totalCalories += meal.totalCalories || 0;
        return `<li><strong>${meal.name}</strong> - ${meal.totalCalories || 0} kcal</li>`;
    }).join('');
    totalCaloriesElem.textContent = totalCalories + ' kcal';
}

// Stat card ilerleme çubuklarını güncelle
