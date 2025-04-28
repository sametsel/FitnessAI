// API servisi importu
import { apiService } from '../../src/services/api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Sidebar toggle fonksiyonu
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarClose = document.querySelector('.sidebar-close');

    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
        sidebar.classList.add('active');
    });
    }

    if (sidebarClose) {
        sidebarClose.addEventListener('click', function() {
        sidebar.classList.remove('active');
    });
    }

    // Çıkış yapma fonksiyonu
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
            
            if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                // Token ve kullanıcı bilgilerini temizle
                localStorage.removeItem('token');
                localStorage.removeItem('userName');
                
                // Login sayfasına yönlendir
                window.location.href = 'login.html';
            }
        });
    }

    // Ana sayfa için init fonksiyonu
    const isDashboard = window.location.pathname.includes('dashboard.html') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname.endsWith('/pages/');
                       
    if (isDashboard) {
        initDashboard();
    }
});

// Dashboard başlangıç fonksiyonu
async function initDashboard() {
    // Kullanıcı girişi kontrolü
    checkAuth();
    
    // Takvim oluştur
    setupCalendar();
    
    // Verileri yükle
    await loadDashboardData();
}

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
}

// Takvim oluştur
function setupCalendar() {
    const calendarEl = document.getElementById('calendar');
    if (!calendarEl) return;
    
    // Mini takvim oluştur
    const calendar = flatpickr(calendarEl, {
        inline: true,
        locale: {
            firstDayOfWeek: 1,
            weekdays: {
                shorthand: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
                longhand: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
            },
            months: {
                shorthand: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
                longhand: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
            }
        },
        onChange: function(selectedDates, dateStr) {
            // Seçilen tarihe göre antrenman ya da beslenme sayfasına yönlendirilebilir
        }
    });
    
    return calendar;
}

// Dashboard verilerini yükle
async function loadDashboardData() {
    showLoading(true);
    
    try {
        // Daily summary verisini al
        const summary = await apiService.getDailySummary();
        
        // Verileri görüntüye aktar
        updateDashboard(summary);
        
        // İşaretlenmiş günleri güncelle
        updateCalendarMarks(summary);
    } catch (error) {
        console.error('Dashboard verileri yükleme hatası:', error);
        showError('Veriler yüklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Yükleme göstergesi
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (!loadingIndicator) return;
    
    if (isLoading) {
        loadingIndicator.style.display = 'flex';
    } else {
        loadingIndicator.style.display = 'none';
    }
}

// Hata mesajı gösterme
function showError(message) {
    alert(message);
}

// Dashboard içeriğini güncelle
function updateDashboard(summary) {
    if (!summary) return;
    
    // Özet kartları
    updateElement('calories-burned', summary.workoutStats?.caloriesBurned || 0);
    updateElement('step-count', summary.workoutStats?.stepCount || 0);
    updateElement('workout-duration', `${summary.workoutStats?.totalDuration || 0} dk`);
    
    // Bugünkü antrenman
    updateTodayWorkout(summary.todayWorkout);
    
    // Sonraki antrenman
    updateNextWorkout(summary.nextWorkout);
    
    // Beslenme özeti
    updateNutritionSummary(summary.todayNutrition);
    
    // Öğünler
    updateMeals(summary.todayNutrition?.meals || []);
}

// Element içeriğini güncelle
function updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

// Bugünkü antrenman bilgilerini güncelle
function updateTodayWorkout(workout) {
    const todayWorkoutContainer = document.getElementById('today-workout');
    if (!todayWorkoutContainer) return;
    
    if (!workout || workout.isEmpty) {
        todayWorkoutContainer.innerHTML = `
            <div class="empty-state">
                <p>Bugün için planlanmış antrenman bulunmuyor.</p>
                <a href="workout.html" class="btn btn-primary">Antrenman Planla</a>
            </div>
        `;
        return;
    }
    
    let statusClass = 'status-pending';
    let statusText = 'Planlandı';
    
    if (workout.completed) {
        statusClass = 'status-completed';
        statusText = 'Tamamlandı';
    } else if (workout.started) {
        statusClass = 'status-ongoing';
        statusText = 'Devam Ediyor';
    }
    
    todayWorkoutContainer.innerHTML = `
        <div class="workout-info">
            <h3>${workout.type || 'Antrenman'}</h3>
            <div class="workout-meta">
                <span class="workout-time"><i class="fas fa-clock"></i> ${workout.duration || 0} dk</span>
                <span class="workout-calories"><i class="fas fa-fire"></i> ${workout.caloriesBurned || 0} kcal</span>
            </div>
            <div class="workout-exercises">
                <span>${workout.exerciseCount || 0} egzersiz</span>
            </div>
            <span class="workout-status ${statusClass}">${statusText}</span>
        </div>
        <div class="workout-actions">
            <a href="workout.html" class="btn btn-primary">Detayları Gör</a>
        </div>
    `;
}

// Sonraki antrenman bilgilerini güncelle
function updateNextWorkout(workout) {
    const nextWorkoutContainer = document.getElementById('next-workout');
    if (!nextWorkoutContainer) return;
    
    if (!workout || workout.isEmpty) {
        nextWorkoutContainer.innerHTML = `
            <div class="empty-state">
                <p>Yaklaşan antrenman bulunmuyor.</p>
                <a href="workout.html" class="btn btn-primary">Antrenman Planla</a>
            </div>
        `;
        return;
    }
    
    const nextDate = new Date(workout.scheduledDate);
    
    nextWorkoutContainer.innerHTML = `
        <div class="workout-info">
            <h3>${workout.type || 'Antrenman'}</h3>
            <div class="workout-meta">
                <span class="workout-date"><i class="fas fa-calendar"></i> ${formatDate(nextDate)}</span>
                <span class="workout-time"><i class="fas fa-clock"></i> ${workout.duration || 0} dk</span>
            </div>
            <div class="workout-exercises">
                <span>${workout.exerciseCount || 0} egzersiz</span>
            </div>
        </div>
        <div class="workout-actions">
            <a href="workout.html" class="btn btn-primary">Detayları Gör</a>
        </div>
    `;
}

// Beslenme özeti bilgilerini güncelle
function updateNutritionSummary(nutrition) {
    const nutritionSummaryContainer = document.getElementById('nutrition-summary');
    if (!nutritionSummaryContainer) return;
    
    if (!nutrition) {
        nutritionSummaryContainer.innerHTML = `
            <div class="empty-state">
                <p>Bugün için beslenme verisi bulunmuyor.</p>
                <a href="nutrition.html" class="btn btn-primary">Beslenme Ekle</a>
            </div>
        `;
        return;
    }
    
    const caloriesPercentage = Math.min(100, ((nutrition.totalCalories || 0) / (nutrition.targetCalories || 2200)) * 100);
    
    nutritionSummaryContainer.innerHTML = `
        <div class="nutrition-overview">
            <div class="nutrition-calories">
                <div class="calories-counter">
                    <span class="current-calories">${nutrition.totalCalories || 0}</span>
                    <span class="calories-divider">/</span>
                    <span class="target-calories">${nutrition.targetCalories || 2200}</span>
                </div>
                <div class="calories-label">Kalori</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${caloriesPercentage}%"></div>
                </div>
            </div>
            
            <div class="nutrition-macros">
                <div class="macro-item">
                    <div class="macro-value">${nutrition.totalProtein || 0}g</div>
                    <div class="macro-label">Protein</div>
                </div>
                <div class="macro-item">
                    <div class="macro-value">${nutrition.totalCarbs || 0}g</div>
                    <div class="macro-label">Karbonhidrat</div>
                </div>
                <div class="macro-item">
                    <div class="macro-value">${nutrition.totalFat || 0}g</div>
                    <div class="macro-label">Yağ</div>
                </div>
            </div>
        </div>
        
        <div class="nutrition-actions">
            <a href="nutrition.html" class="btn btn-primary">Detayları Gör</a>
        </div>
    `;
}

// Öğünleri güncelle
function updateMeals(meals) {
    const mealsContainer = document.getElementById('meals-container');
    if (!mealsContainer) return;
    
    if (!meals || meals.length === 0) {
        mealsContainer.innerHTML = `
            <div class="empty-state">
                <p>Bugün için kayıtlı öğün bulunmuyor.</p>
                <a href="nutrition.html" class="btn btn-primary">Öğün Ekle</a>
            </div>
        `;
        return;
    }
    
    // Öğün türlerine göre ikonlar
    const mealIcons = {
        breakfast: 'sun',
        lunch: 'cloud-sun',
        dinner: 'moon',
        snack: 'cookie'
    };
    
    let html = '';
    
    meals.forEach(meal => {
        const iconName = mealIcons[meal.type] || 'utensils';
        
        html += `
            <div class="meal-item">
                <div class="meal-icon">
                    <i class="fas fa-${iconName}"></i>
                </div>
                <div class="meal-info">
                    <h4>${meal.name}</h4>
                    <div class="meal-time">${meal.time || ''}</div>
                </div>
                <div class="meal-calories">
                    ${meal.calories || 0} kcal
                </div>
            </div>
        `;
    });
    
    mealsContainer.innerHTML = html;
}

// Takvimde işaretlenmiş günleri güncelle
function updateCalendarMarks(summary) {
    const calendar = document.querySelector('.flatpickr-calendar');
    if (!calendar) return;
    
    // Bugünün tarihi
    const today = new Date();
    const todayStr = formatDateYMD(today);
    
    // İşaretlenecek günler
    const markedDates = {
        [todayStr]: {
            color: '#00adf5',
            tooltip: 'Bugün'
        }
    };
    
    // Sonraki antrenman
    if (summary.nextWorkout && summary.nextWorkout.scheduledDate) {
        const nextWorkoutDate = formatDateYMD(new Date(summary.nextWorkout.scheduledDate));
        markedDates[nextWorkoutDate] = {
            color: '#ff9500',
            tooltip: 'Antrenman'
        };
    }
    
    // İşaretleri güncelle
    const days = calendar.querySelectorAll('.flatpickr-day');
    days.forEach(day => {
        const dateStr = day.getAttribute('aria-label');
        if (dateStr) {
            const formattedDate = formatDateYMD(new Date(dateStr));
            
            // Mevcut işaretleri temizle
            day.classList.remove('marked');
            day.style.backgroundColor = '';
            
            // Yeni işaret varsa ekle
            if (markedDates[formattedDate]) {
                day.classList.add('marked');
                day.style.backgroundColor = markedDates[formattedDate].color + '33'; // %20 opaklık
                day.title = markedDates[formattedDate].tooltip || '';
            }
        }
    });
}

// Tarih formatla (gün adıyla birlikte)
function formatDate(date) {
    if (!date) return '';
    
    const day = date.getDate();
    const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const month = monthNames[date.getMonth()];
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dayName = dayNames[date.getDay()];
    
    return `${day} ${month}, ${dayName}`;
}

// Tarih formatla (YYYY-MM-DD)
function formatDateYMD(date) {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
} 