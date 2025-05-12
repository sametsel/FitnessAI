import { apiService } from '../../src/services/api.js';
import { setupLogout } from './utils/logout.js';

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Kullanıcı oturumunu kontrol et
        checkAuth();

        // Kullanıcı bilgilerini yükle
        await loadUserProfile();
        
        // Form işlemleri
        setupProfileForm();
        
        // Profil fotoğrafı değiştirme
        setupAvatarChange();
        
        // İlerleme grafiği
        setupProgressChart();
        
        // Hedefler
        setupGoals();
        
        // Başarılar
        setupAchievements();
        
        setupLogout();
        
    } catch (error) {
        console.error('Profil yüklenirken hata:', error);
        showNotification('Profil bilgileri yüklenirken bir hata oluştu', 'error');
    }
});

// Kullanıcı oturumunu kontrol et
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        // Token yoksa login sayfasına yönlendir
        window.location.href = 'login.html';
        return;
    }

    // Kullanıcı adını göster
    const userName = localStorage.getItem('userName') || 'Kullanıcı';
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Hoşgeldin, ${userName}`;
    }

    // Profil sayfasındaki kullanıcı adını güncelle
    const profileName = document.querySelector('.profile-info h1');
    if (profileName) {
        profileName.textContent = userName;
    }
}

/**
 * Kullanıcı profil bilgilerini yükler
 */
async function loadUserProfile() {
    try {
        console.log('Profil yükleme başladı...');
        
        // Token kontrolü
        const token = localStorage.getItem('token');
        console.log('Token durumu:', token ? 'Var' : 'Yok');
        
        // API'den kullanıcı verilerini al
        console.log('API isteği gönderiliyor...');
        const apiUserData = await apiService.getUserProfile();
        console.log('API yanıtı:', apiUserData);
        
        // Profil başlığını güncelle
        updateProfileHeader(apiUserData);
        
        // Form alanlarını doldur
        updateProfileForm(apiUserData);
        
        // Profil fotoğrafını güncelle
        updateProfileAvatar(apiUserData);
        
        // Hedefleri güncelle
        if (apiUserData.goals) {
            updateGoals(apiUserData.goals);
        }

        // LocalStorage'ı güncelle
        localStorage.setItem('userData', JSON.stringify(apiUserData));
        localStorage.setItem('userName', apiUserData.name);
        
        console.log('Profil yükleme tamamlandı');
        
    } catch (error) {
        console.error('Profil yükleme hatası:', error);
        showNotification('Profil bilgileri yüklenirken bir hata oluştu', 'error');
    }
}

/**
 * Profil başlığını günceller
 */
function updateProfileHeader(userData) {
    // Kullanıcı adı
    const profileName = document.querySelector('.profile-info h1');
    if (profileName) {
        profileName.textContent = userData.name || 'Kullanıcı';
    }
    
    // Üyelik tarihi
    const membershipDate = new Date(userData.createdAt || Date.now()).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const membershipElement = document.querySelector('.membership-date');
    if (membershipElement) {
        membershipElement.innerHTML = `
            <i class="fas fa-calendar-alt"></i> 
            Üyelik Tarihi: ${membershipDate}
        `;
    }
    
    // İstatistikler
    const stats = document.querySelector('.profile-stats');
    if (stats) {
        stats.innerHTML = `
            <div class="stat-card">
                <i class="fas fa-dumbbell"></i>
                <div class="stat-info">
                    <span class="stat-value">${userData.totalWorkouts || 0}</span>
                    <span class="stat-label">Antrenman</span>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-fire"></i>
                <div class="stat-info">
                    <span class="stat-value">${userData.totalCaloriesBurned?.toLocaleString('tr-TR') || 0}</span>
                    <span class="stat-label">Kalori</span>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-trophy"></i>
                <div class="stat-info">
                    <span class="stat-value">${userData.completedGoals || 0}</span>
                    <span class="stat-label">Hedef</span>
                </div>
            </div>
        `;
    }
    
    // Premium rozeti
    const premiumBadge = document.querySelector('.premium-badge');
    if (premiumBadge) {
        premiumBadge.style.display = userData.isPremium ? 'flex' : 'none';
    }

    // Kullanıcı karşılama mesajı
    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        userGreeting.textContent = `Hoşgeldin, ${userData.name || 'Kullanıcı'}`;
    }
}

/**
 * Profil formunu günceller
 */
function updateProfileForm(userData) {
    const form = document.querySelector('.profile-form');
    if (!form) return;

    // Form alanlarını doldur
    const formData = {
        name: userData.name || '',
        email: userData.email || '',
        age: userData.age || '',
        gender: userData.gender || '',
        height: userData.height || '',
        weight: userData.weight || '',
        activityLevel: userData.activityLevel || ''
    };

    Object.entries(formData).forEach(([key, value]) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = value;
        }
    });

    // Form gönderildiğinde
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.innerHTML;
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kaydediliyor...';
        
        try {
            // Form verilerini topla
            const formData = new FormData(this);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                age: parseInt(formData.get('age')),
                gender: formData.get('gender'),
                height: parseInt(formData.get('height')),
                weight: parseFloat(formData.get('weight')),
                activityLevel: formData.get('activityLevel')
            };

            // API'ye gönder
            const updatedUser = await apiService.updateProfile(userData);
            
            // LocalStorage'ı güncelle
            localStorage.setItem('userData', JSON.stringify(updatedUser));
            localStorage.setItem('userName', userData.name);

            showNotification('Profil başarıyla güncellendi!', 'success');
            
            // Profili yeniden yükle
            await loadUserProfile();
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            showNotification(error.message || 'Profil güncellenirken bir hata oluştu', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = originalButtonText;
        }
    });
}

/**
 * Profil fotoğrafını günceller
 */
function updateProfileAvatar(userData) {
    const avatarImgs = document.querySelectorAll('.profile-avatar img, .user-profile img');
    avatarImgs.forEach(img => {
        if (userData.avatarUrl) {
            img.src = userData.avatarUrl;
            img.onerror = () => {
                img.src = '../assets/images/avatar.png';
            };
        }
    });
}

/**
 * Profil fotoğrafı değiştirme işlemlerini ayarlar
 */
function setupAvatarChange() {
    const changeAvatarBtn = document.querySelector('.change-avatar');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const formData = new FormData();
                        formData.append('avatar', file);

                        const response = await apiService.updateAvatar(formData);

                        if (response.success && response.avatarUrl) {
                            // Profil fotoğrafını güncelle
                            const avatarImgs = document.querySelectorAll('.profile-avatar img, .user-profile img');
                            avatarImgs.forEach(img => {
                                img.src = response.avatarUrl;
                            });

                            // LocalStorage'ı güncelle
                            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
                            userData.avatarUrl = response.avatarUrl;
                            localStorage.setItem('userData', JSON.stringify(userData));

                            showNotification('Profil fotoğrafı güncellendi!', 'success');
                        } else {
                            throw new Error('Fotoğraf yüklenirken bir hata oluştu');
                        }
                    } catch (error) {
                        console.error('Fotoğraf yükleme hatası:', error);
                        showNotification(error.message, 'error');
                    }
                }
            };

            input.click();
        });
    }
}

/**
 * İlerleme grafiğini ayarlar
 */
function setupProgressChart() {
    const ctx = document.getElementById('progressChart');
    if (!ctx) return;

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Kilo Takibi',
                data: [],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255,255,255,0.2)',
                    borderWidth: 1
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });

    // İlerleme türü değiştiğinde grafiği güncelle
    const progressTypeSelect = document.querySelector('.progress-type-select');
    if (progressTypeSelect) {
        progressTypeSelect.addEventListener('change', async () => {
            try {
                const type = progressTypeSelect.value;
                const data = await apiService.getProgress(type);
                updateProgressChart(data);
            } catch (error) {
                console.error('İlerleme verileri alınırken hata:', error);
                showNotification('İlerleme verileri alınamadı', 'error');
            }
        });
    }

    // Yenile butonu
    const refreshBtn = document.querySelector('.btn-refresh');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            try {
                const type = progressTypeSelect.value;
                const data = await apiService.getProgress(type);
                updateProgressChart(data);
                showNotification('Veriler güncellendi!', 'success');
            } catch (error) {
                console.error('Veriler güncellenirken hata:', error);
                showNotification('Veriler güncellenemedi', 'error');
            }
        });
    }
}

/**
 * İlerleme grafiğini günceller
 */
function updateProgressChart(data) {
    const chart = Chart.getChart('progressChart');
    if (!chart) return;

    chart.data.labels = data.labels;
    chart.data.datasets[0].data = data.values;
    chart.data.datasets[0].label = data.label;
    chart.update();
}

/**
 * Hedefler bölümünü ayarlar
 */
function setupGoals() {
    const addGoalBtn = document.querySelector('.btn-add');
    if (addGoalBtn) {
        addGoalBtn.addEventListener('click', () => {
            // Yeni hedef ekleme modalını aç
            showAddGoalModal();
        });
    }
}

/**
 * Hedefleri günceller
 */
function updateGoals(goals) {
    const goalsGrid = document.querySelector('.goals-grid');
    if (!goalsGrid) return;

    goalsGrid.innerHTML = goals.map(goal => `
        <div class="goal-card">
            <div class="goal-icon">
                <i class="fas ${getGoalIcon(goal.type)}"></i>
            </div>
            <div class="goal-info">
                <h3>${goal.title}</h3>
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress" style="width: ${goal.progress}%"></div>
                    </div>
                    <span class="progress-text">${goal.progress}%</span>
                </div>
                <p class="goal-details">
                    <span>${goal.startValue} ${goal.unit}</span>
                    <span>${goal.targetValue} ${goal.unit}</span>
                </p>
                <span class="goal-status">${goal.remainingText}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Başarılar bölümünü ayarlar
 */
function setupAchievements() {
    // Başarılar için tıklama olayları vs.
}

/**
 * Başarıları günceller
 */
function updateAchievements(achievements) {
    const achievementsGrid = document.querySelector('.achievements-grid');
    if (!achievementsGrid) return;

    achievementsGrid.innerHTML = achievements.map(achievement => `
        <div class="achievement-card ${achievement.achieved ? 'achieved' : ''}">
            <div class="achievement-icon">
                <i class="fas ${achievement.icon}"></i>
            </div>
            <div class="achievement-info">
                <h3>${achievement.title}</h3>
                <p>${achievement.description}</p>
            </div>
        </div>
    `).join('');
}

/**
 * Hedef tipine göre ikon döndürür
 */
function getGoalIcon(type) {
    const icons = {
        weight: 'fa-weight',
        workout: 'fa-dumbbell',
        nutrition: 'fa-utensils',
        cardio: 'fa-running',
        strength: 'fa-dumbbell',
        endurance: 'fa-heartbeat',
        flexibility: 'fa-child'
    };
    return icons[type] || 'fa-bullseye';
}

/**
 * Bildirim gösterir
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    // Animasyon için setTimeout kullan
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
} 