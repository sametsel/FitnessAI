// API servisi importu
// import { apiService } from '../../src/services/api.js';
// Global apiService değişkeni zaten script tag olarak yüklendi

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde aksiyon
    init();
});

// Global değişkenler
let selectedDate = new Date();
let workoutData = null;
let recommendations = null;

// Sayfa başlangıç fonksiyonu
async function init() {
    // Kullanıcı girişi kontrolü
    checkAuth();
    
    // Tarih seçici ayarları
    setupDatePicker();
    
    // Butonlara event listener'lar ekle
    setupEventListeners();
    
    // Verileri yükle
    await loadData();
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
    document.getElementById('userGreeting').textContent = `Hoşgeldin, ${userName}`;
}

// Tarih seçici ayarları
function setupDatePicker() {
    // Flatpickr ile tarih seçiciyi başlat
    const datePicker = flatpickr('#date-picker', {
        dateFormat: "d MMMM yyyy, dddd",
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
        defaultDate: selectedDate,
        onChange: function(selectedDates) {
            selectedDate = selectedDates[0];
            loadData();
        }
    });

    // Manuel tarih navigasyonu butonları
    document.querySelector('.prev-date').addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() - 1);
        datePicker.setDate(selectedDate);
        loadData();
    });

    document.querySelector('.next-date').addEventListener('click', () => {
        selectedDate.setDate(selectedDate.getDate() + 1);
        datePicker.setDate(selectedDate);
        loadData();
    });
}

// Olay dinleyicileri
function setupEventListeners() {
    // Antrenman başlatma ve tamamlama
    const startWorkoutBtn = document.getElementById('start-workout-btn');
    const completeWorkoutBtn = document.getElementById('complete-workout-btn');
    
    startWorkoutBtn.addEventListener('click', startWorkout);
    completeWorkoutBtn.addEventListener('click', completeWorkout);
    
    // Egzersiz ekleme
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const addExerciseModal = document.getElementById('add-exercise-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelExerciseBtn = document.getElementById('cancel-exercise-btn');
    const addExerciseForm = document.getElementById('add-exercise-form');
    
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', () => {
            addExerciseModal.style.display = 'block';
        });
    }
    
    closeModal.addEventListener('click', () => {
        addExerciseModal.style.display = 'none';
    });
    
    cancelExerciseBtn.addEventListener('click', () => {
        addExerciseModal.style.display = 'none';
    });
    
    addExerciseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveExercise();
    });

    // Öneriler toggle butonu
    document.getElementById('toggle-recommendations-btn').addEventListener('click', toggleRecommendations);

    // Antrenman geçmişi filtresi
    document.getElementById('history-filter-select').addEventListener('change', (e) => {
        loadWorkoutHistory(e.target.value);
    });

    // Modal dışı tıklama ile kapatma
    window.addEventListener('click', (e) => {
        if (e.target === addExerciseModal) {
            addExerciseModal.style.display = 'none';
        }
    });
}

// Veri yükleme fonksiyonu
async function loadData() {
    showLoading(true);
    
    try {
        // Antrenman verileri
        workoutData = await apiService.getTodayWorkout();
        
        // Yapay zeka önerileri
        recommendations = await apiService.getWorkoutRecommendation();
        
        // İstatistikleri yükle
        const stats = await apiService.getWorkoutStats();
        
        // Verileri görüntüye aktar
        updateUI(stats);
        
        // Antrenman geçmişini yükle
        loadWorkoutHistory('week');
    } catch (error) {
        console.error('Veri yükleme hatası:', error);
        showError('Veriler yüklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Yükleme göstergesi
function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loading-indicator');
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

// Arayüzü güncelleme
function updateUI(stats) {
    // Antrenman durumu
    updateWorkoutStatus();
    
    // İstatistikler
    document.getElementById('calories-burned').textContent = stats?.caloriesBurned || 0;
    document.getElementById('workout-duration').textContent = `${stats?.totalDuration || 0} dk`;
    document.getElementById('completed-workouts').textContent = stats?.completedWorkouts || 0;
    
    // Egzersizleri güncelle
    updateExercises();
    
    // Önerileri güncelle
    updateRecommendations();
}

// Antrenman durumunu güncelle
function updateWorkoutStatus() {
    const statusElement = document.getElementById('workout-status');
    const typeElement = document.getElementById('workout-type');
    const startBtn = document.getElementById('start-workout-btn');
    const completeBtn = document.getElementById('complete-workout-btn');
    const addExerciseBtn = document.getElementById('add-exercise-btn');

    if (!workoutData) {
        statusElement.textContent = 'Antrenman Planlanmamış';
        typeElement.textContent = 'Bugün için planlanmış antrenman bulunmuyor';
        startBtn.style.display = 'block';
        completeBtn.style.display = 'none';
        if (addExerciseBtn) addExerciseBtn.style.display = 'none';
        return;
    }

    typeElement.textContent = workoutData.type || 'Antrenman';

    if (workoutData.completed) {
        statusElement.textContent = 'Tamamlandı';
        startBtn.style.display = 'none';
        completeBtn.style.display = 'none';
        if (addExerciseBtn) addExerciseBtn.style.display = 'none';
    } else if (workoutData.started) {
        statusElement.textContent = 'Devam Ediyor';
        startBtn.style.display = 'none';
        completeBtn.style.display = 'block';
        if (addExerciseBtn) addExerciseBtn.style.display = 'block';
    } else {
        statusElement.textContent = 'Planlandı';
        startBtn.style.display = 'block';
        completeBtn.style.display = 'none';
        if (addExerciseBtn) addExerciseBtn.style.display = 'none';
    }
}

// Egzersizleri güncelle
function updateExercises() {
    const exercisesContainer = document.getElementById('exercises-container');
    
    if (!workoutData || !workoutData.exercises || workoutData.exercises.length === 0) {
        exercisesContainer.innerHTML = '<p class="empty-state">Bu antrenman için kayıtlı egzersiz bulunmamaktadır.</p>';
        return;
    }
    
    let html = '';
    
    // Egzersiz tiplerine göre ikonlar
    const exerciseIcons = {
        strength: 'dumbbell',
        cardio: 'running',
        flexibility: 'child'
    };
    
    workoutData.exercises.forEach(exercise => {
        const iconName = exerciseIcons[exercise.type] || 'dumbbell';
        
        html += `
            <div class="exercise-card" data-id="${exercise.id}">
                <div class="exercise-header">
                    <div class="exercise-title">
                        <i class="fas fa-${iconName}"></i>
                        <h3>${exercise.name}</h3>
                    </div>
                    <span>${exercise.completed ? '<i class="fas fa-check-circle" style="color: #4caf50;"></i>' : ''}</span>
                </div>
                <div class="exercise-details">
                    <div class="exercise-stats">
        `;
        
        // Egzersiz detayları
        if (exercise.type === 'strength') {
            html += `
                <div class="exercise-stat">
                    <span class="value">${exercise.sets}</span>
                    <span class="label">Set</span>
                </div>
                <div class="exercise-stat">
                    <span class="value">${exercise.reps}</span>
                    <span class="label">Tekrar</span>
                </div>
                <div class="exercise-stat">
                    <span class="value">${exercise.weight} kg</span>
                    <span class="label">Ağırlık</span>
                </div>
            `;
        } else {
            html += `
                <div class="exercise-stat">
                    <span class="value">${exercise.duration}</span>
                    <span class="label">Dakika</span>
                </div>
                <div class="exercise-stat">
                    <span class="value">${exercise.caloriesBurned || 0}</span>
                    <span class="label">Kalori</span>
                </div>
            `;
        }
        
        html += `
                    </div>
                    ${exercise.notes ? `<p class="exercise-notes">${exercise.notes}</p>` : ''}
                    
                    <div class="exercise-actions">
                        <button class="btn btn-outline-small edit-exercise" data-id="${exercise.id}">Düzenle</button>
                        <button class="btn btn-outline-small toggle-complete" data-id="${exercise.id}">
                            ${exercise.completed ? 'Tamamlanmadı İşaretle' : 'Tamamlandı İşaretle'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    exercisesContainer.innerHTML = html;
    
    // Düzenleme ve tamamlama butonlarına olay dinleyicisi ekle
    document.querySelectorAll('.edit-exercise').forEach(button => {
        button.addEventListener('click', (e) => {
            const exerciseId = e.target.getAttribute('data-id');
            editExercise(exerciseId);
        });
    });

    document.querySelectorAll('.toggle-complete').forEach(button => {
        button.addEventListener('click', (e) => {
            const exerciseId = e.target.getAttribute('data-id');
            toggleExerciseComplete(exerciseId);
        });
    });
}

// Yapay zeka önerilerini güncelle
function updateRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    
    if (!recommendations || !recommendations.exercises || recommendations.exercises.length === 0) {
        recommendationsContainer.innerHTML = '<p class="empty-state">Bu tarih için antrenman önerisi bulunmamaktadır.</p>';
        return;
    }
    
    let html = '';
    html += `
        <div class="recommendation-header">
            <p class="recommendation-description">${recommendations.description || 'Sizin için önerilen antrenman programı'}</p>
            <button id="apply-recommendations-btn" class="btn btn-primary">Önerileri Uygula</button>
        </div>
        
        <div class="recommendation-workout">
            <h3>${recommendations.type || 'Önerilen Antrenman'}</h3>
            
            <div class="recommended-exercises">
    `;
    
    recommendations.exercises.forEach(exercise => {
        html += `
            <div class="recommended-exercise">
                <div class="recommended-exercise-name">${exercise.name}</div>
                <div class="recommended-exercise-details">
        `;
        
        if (exercise.type === 'strength') {
            html += `${exercise.sets} set x ${exercise.reps} tekrar ${exercise.weight ? `(${exercise.weight} kg)` : ''}`;
        } else {
            html += `${exercise.duration} dakika`;
        }
        
        html += `
                </div>
            </div>
        `;
    });
    
    html += `
            </div>
        </div>
    `;
    
    recommendationsContainer.innerHTML = html;
    
    // Önerileri uygula butonuna olay dinleyicisi ekle
    document.getElementById('apply-recommendations-btn').addEventListener('click', applyRecommendations);
}

// Antrenman geçmişini yükle
async function loadWorkoutHistory(period) {
    const historyContainer = document.getElementById('workout-history-container');
    
    try {
        // Tarih aralığını belirle
        let startDate = new Date();
        
        if (period === 'week') {
            // Son bir hafta
            startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'month') {
            // Son bir ay
            startDate.setMonth(startDate.getMonth() - 1);
        } else {
            // Tüm zamanlar
            startDate = null;
        }
        
        const workouts = await apiService.getWorkouts(startDate, new Date());
        
        if (!workouts || workouts.length === 0) {
            historyContainer.innerHTML = '<p class="empty-state">Geçmiş antrenman kaydı bulunamadı.</p>';
            return;
        }
        
        let html = '';
        
        // Son tarihten ilk tarihe doğru sırala
        workouts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        workouts.forEach(workout => {
            const workoutDate = new Date(workout.date);
            
            html += `
                <div class="history-item">
                    <div class="history-info">
                        <div class="history-date">${workoutDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}</div>
                        <div class="history-workout-type">${workout.type}</div>
                    </div>
                    <div class="history-details">
                        <div class="history-stat">
                            <i class="fas fa-fire"></i>
                            <span>${workout.caloriesBurned || 0} kcal</span>
                        </div>
                        <div class="history-stat">
                            <i class="fas fa-clock"></i>
                            <span>${workout.duration || 0} dk</span>
                        </div>
                        <span class="history-badge ${workout.completed ? 'badge-completed' : 'badge-pending'}">
                            ${workout.completed ? 'Tamamlandı' : 'Devam Ediyor'}
                        </span>
                    </div>
                </div>
            `;
        });
        
        historyContainer.innerHTML = html;
    } catch (error) {
        console.error('Antrenman geçmişi yükleme hatası:', error);
        historyContainer.innerHTML = '<p class="empty-state">Geçmiş antrenmanlar yüklenirken bir hata oluştu.</p>';
    }
}

// Önerileri göster/gizle
function toggleRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    const toggleBtn = document.getElementById('toggle-recommendations-btn');
    
    if (recommendationsContainer.style.display === 'none') {
        recommendationsContainer.style.display = 'block';
        toggleBtn.textContent = 'Önerileri Gizle';
    } else {
        recommendationsContainer.style.display = 'none';
        toggleBtn.textContent = 'Önerileri Göster';
    }
}

// Antrenmanı başlat
async function startWorkout() {
    if (!confirm('Antrenmanı başlatmak istediğinize emin misiniz?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        if (!workoutData) {
            // Yeni antrenman oluştur
            const workoutType = prompt('Antrenman türünü girin (örn. Tam Vücut, Üst Vücut, Kardio):', 'Tam Vücut');
            
            if (!workoutType) {
                showLoading(false);
                return;
            }
            
            const newWorkout = {
                type: workoutType,
                date: selectedDate.toISOString(),
                started: true,
                completed: false
            };
            
            workoutData = await apiService.createWorkout(newWorkout);
        } else {
            // Var olan antrenmanı başlat
            workoutData.started = true;
            workoutData = await apiService.updateWorkout(workoutData.id, { started: true });
        }
        
        // Arayüzü güncelle
        const addExerciseBtn = document.getElementById('add-exercise-btn');
        if (addExerciseBtn) addExerciseBtn.style.display = 'block';
        
        updateWorkoutStatus();
    } catch (error) {
        console.error('Antrenman başlatma hatası:', error);
        showError('Antrenman başlatılırken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Antrenmanı tamamla
async function completeWorkout() {
    if (!workoutData || !workoutData.id) {
        showError('Tamamlanacak antrenman bulunamadı.');
        return;
    }
    
    if (!confirm('Antrenmanı tamamlamak istediğinize emin misiniz?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        workoutData = await apiService.completeWorkout(workoutData.id);
        
        // Arayüzü güncelle
        const addExerciseBtn = document.getElementById('add-exercise-btn');
        if (addExerciseBtn) addExerciseBtn.style.display = 'none';
        
        updateWorkoutStatus();
        
        // Başarı mesajı
        alert('Antrenman başarıyla tamamlandı!');
    } catch (error) {
        console.error('Antrenman tamamlama hatası:', error);
        showError('Antrenman tamamlanırken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Egzersiz kaydet
async function saveExercise() {
    if (!workoutData || !workoutData.id) {
        showError('Önce bir antrenman başlatmalısınız.');
        return;
    }
    
    const name = document.getElementById('exercise-name').value;
    const type = document.getElementById('exercise-type').value;
    const sets = parseInt(document.getElementById('exercise-sets').value) || 0;
    const reps = parseInt(document.getElementById('exercise-reps').value) || 0;
    const weight = parseFloat(document.getElementById('exercise-weight').value) || 0;
    const duration = parseInt(document.getElementById('exercise-duration').value) || 0;
    const notes = document.getElementById('exercise-notes').value;
    
    // Egzersiz datasını oluştur
    const exerciseData = {
        name,
        type,
        sets,
        reps,
        weight,
        duration,
        notes,
        completed: false
    };
    
    showLoading(true);
    
    try {
        // API'ye egzersiz ekle isteği gönder
        await apiService.addExercise(workoutData.id, exerciseData);
        
        // Modalı kapat
        document.getElementById('add-exercise-modal').style.display = 'none';
        
        // Formu sıfırla
        document.getElementById('add-exercise-form').reset();
        
        // Verileri yenile
        await loadData();
        
        // Başarı mesajı
        alert('Egzersiz başarıyla eklendi!');
    } catch (error) {
        console.error('Egzersiz ekleme hatası:', error);
        showError('Egzersiz eklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Egzersiz düzenle
function editExercise(exerciseId) {
    alert(`${exerciseId} ID'li egzersiz düzenleme fonksiyonu henüz uygulanmadı.`);
}

// Egzersiz tamamlama durumunu değiştir
async function toggleExerciseComplete(exerciseId) {
    if (!workoutData || !workoutData.id) {
        showError('Antrenman bulunamadı.');
        return;
    }
    
    const exercise = workoutData.exercises.find(ex => ex.id === exerciseId);
    
    if (!exercise) {
        showError('Egzersiz bulunamadı.');
        return;
    }
    
    showLoading(true);
    
    try {
        // Tamamlama durumunu tersine çevir
        const completed = !exercise.completed;
        
        // API'ye egzersiz güncelleme isteği gönder
        await apiService.updateExercise(workoutData.id, exerciseId, { completed });
        
        // Verileri yenile
        await loadData();
    } catch (error) {
        console.error('Egzersiz güncelleme hatası:', error);
        showError('Egzersiz güncellenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Önerileri uygula
async function applyRecommendations() {
    if (!recommendations || !recommendations.exercises) {
        showError('Uygulanacak öneri bulunamadı.');
        return;
    }
    
    if (!confirm('Yapay zeka önerilerini antrenman planınıza eklemek istediğinize emin misiniz?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        // Eğer aktif antrenman yoksa yeni bir tane oluştur
        if (!workoutData) {
            const newWorkout = {
                type: recommendations.type || 'Önerilen Antrenman',
                date: selectedDate.toISOString(),
                started: true,
                completed: false
            };
            
            workoutData = await apiService.createWorkout(newWorkout);
        }
        
        // API'ye önerileri uygula isteği gönder
        await apiService.applyWorkoutRecommendations(workoutData.id);
        
        // Sayfayı yenile
        await loadData();
        
        // Başarı mesajı
        alert('Öneriler başarıyla uygulandı!');
    } catch (error) {
        console.error('Önerileri uygulama hatası:', error);
        showError('Öneriler uygulanırken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
} 