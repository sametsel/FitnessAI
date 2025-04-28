// API servisi importu
import { apiService } from '../../src/services/api.js';

document.addEventListener('DOMContentLoaded', function() {
    // Sayfa yüklendiğinde aksiyon
    init();
});

// Global değişkenler
let selectedDate = new Date();
let nutritionData = null;
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
    // Öğün ekleme
    const addMealBtn = document.getElementById('add-meal-btn');
    const addMealModal = document.getElementById('add-meal-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelMealBtn = document.getElementById('cancel-meal-btn');
    const addMealForm = document.getElementById('add-meal-form');
    const addFoodBtn = document.getElementById('add-food-btn');
    
    addMealBtn.addEventListener('click', () => {
        addMealModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        addMealModal.style.display = 'none';
    });
    
    cancelMealBtn.addEventListener('click', () => {
        addMealModal.style.display = 'none';
    });
    
    addMealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveMeal();
    });
    
    addFoodBtn.addEventListener('click', addFoodItem);

    // Öneriler toggle butonu
    document.getElementById('toggle-recommendations-btn').addEventListener('click', toggleRecommendations);

    // Modal dışı tıklama ile kapatma
    window.addEventListener('click', (e) => {
        if (e.target === addMealModal) {
            addMealModal.style.display = 'none';
        }
    });
}

// Veri yükleme fonksiyonu
async function loadData() {
    showLoading(true);
    
    try {
        // Beslenme verileri
        nutritionData = await apiService.getNutrition(selectedDate);
        
        // Yapay zeka önerileri
        recommendations = await apiService.getNutritionRecommendation(selectedDate);
        
        // Verileri görüntüye aktar
        updateUI();
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
function updateUI() {
    if (!nutritionData) {
        // Veri yoksa varsayılan değerleri kullan
        document.getElementById('current-calories').textContent = '0';
        document.getElementById('target-calories').textContent = '2200';
        document.getElementById('current-protein').textContent = '0';
        document.getElementById('target-protein').textContent = '150';
        document.getElementById('current-carbs').textContent = '0';
        document.getElementById('target-carbs').textContent = '250';
        document.getElementById('current-fat').textContent = '0';
        document.getElementById('target-fat').textContent = '80';
        
        // İlerleme çubuklarını sıfırla
        document.getElementById('calories-progress').style.width = '0%';
        document.getElementById('protein-progress').style.width = '0%';
        document.getElementById('carbs-progress').style.width = '0%';
        document.getElementById('fat-progress').style.width = '0%';
        
        // Öğünleri temizle
        document.getElementById('meals-container').innerHTML = '<p class="empty-state">Bu tarih için kayıtlı öğün bulunmamaktadır.</p>';
        
        return;
    }
    
    // Makro değerlerini güncelle
    const { totalCalories, targetCalories, totalProtein, targetProtein, 
            totalCarbs, targetCarbs, totalFat, targetFat, meals } = nutritionData;
    
    document.getElementById('current-calories').textContent = totalCalories || 0;
    document.getElementById('target-calories').textContent = targetCalories || 2200;
    document.getElementById('current-protein').textContent = totalProtein || 0;
    document.getElementById('target-protein').textContent = targetProtein || 150;
    document.getElementById('current-carbs').textContent = totalCarbs || 0;
    document.getElementById('target-carbs').textContent = targetCarbs || 250;
    document.getElementById('current-fat').textContent = totalFat || 0;
    document.getElementById('target-fat').textContent = targetFat || 80;
    
    // İlerleme çubuklarını güncelle
    const caloriesPercentage = Math.min(100, ((totalCalories || 0) / (targetCalories || 2200)) * 100);
    const proteinPercentage = Math.min(100, ((totalProtein || 0) / (targetProtein || 150)) * 100);
    const carbsPercentage = Math.min(100, ((totalCarbs || 0) / (targetCarbs || 250)) * 100);
    const fatPercentage = Math.min(100, ((totalFat || 0) / (targetFat || 80)) * 100);
    
    document.getElementById('calories-progress').style.width = `${caloriesPercentage}%`;
    document.getElementById('protein-progress').style.width = `${proteinPercentage}%`;
    document.getElementById('carbs-progress').style.width = `${carbsPercentage}%`;
    document.getElementById('fat-progress').style.width = `${fatPercentage}%`;
    
    // Öğünleri güncelle
    updateMeals(meals || []);
    
    // Önerileri güncelle
    updateRecommendations();
}

// Öğünleri görüntüle
function updateMeals(meals) {
    const mealsContainer = document.getElementById('meals-container');
    
    if (!meals || meals.length === 0) {
        mealsContainer.innerHTML = '<p class="empty-state">Bu tarih için kayıtlı öğün bulunmamaktadır.</p>';
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
            <div class="meal-card" data-id="${meal.id}">
                <div class="meal-header">
                    <h3><i class="fas fa-${iconName}"></i> ${meal.name}</h3>
                    <span>${meal.time}</span>
                </div>
                <div class="meal-items">
        `;
        
        // Yiyecekleri listele
        meal.foods.forEach(food => {
            html += `
                <div class="meal-item">
                    <span>${food.name}</span>
                    <span>${food.calories} kcal</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="meal-footer">
                    <span>Toplam: ${meal.calories} kcal</span>
                    <div class="meal-actions">
                        <button class="btn btn-outline-small edit-meal" data-id="${meal.id}">Düzenle</button>
                        <button class="btn btn-outline-small delete-meal" data-id="${meal.id}">Sil</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    mealsContainer.innerHTML = html;
    
    // Düzenleme ve silme butonlarına olay dinleyicisi ekle
    document.querySelectorAll('.edit-meal').forEach(button => {
        button.addEventListener('click', (e) => {
            const mealId = e.target.getAttribute('data-id');
            editMeal(mealId);
        });
    });

    document.querySelectorAll('.delete-meal').forEach(button => {
        button.addEventListener('click', (e) => {
            const mealId = e.target.getAttribute('data-id');
            deleteMeal(mealId);
        });
    });
}

// Yapay zeka önerilerini güncelle
function updateRecommendations() {
    const recommendationsContainer = document.getElementById('recommendations-container');
    
    if (!recommendations || !recommendations.meals || recommendations.meals.length === 0) {
        recommendationsContainer.innerHTML = '<p class="empty-state">Bu tarih için beslenme önerisi bulunmamaktadır.</p>';
        return;
    }
    
    let html = '';
    html += `
        <div class="recommendation-header">
            <p class="recommendation-description">${recommendations.description || 'Sizin için önerilen beslenme programı'}</p>
            <button id="apply-recommendations-btn" class="btn btn-primary">Önerileri Uygula</button>
        </div>
    `;
    
    // Önerilen öğünleri listele
    html += '<div class="recommendation-meals">';
    
    recommendations.meals.forEach(meal => {
        html += `
            <div class="recommendation-meal">
                <div class="meal-header">
                    <h3>${meal.name}</h3>
                    <span>${meal.time || ''}</span>
                </div>
                <div class="meal-items">
        `;
        
        meal.foods.forEach(food => {
            html += `
                <div class="meal-item">
                    <span>${food.name} (${food.portion})</span>
                    <span>${food.calories} kcal</span>
                </div>
            `;
        });
        
        html += `
                </div>
                <div class="meal-macros">
                    <span>Protein: ${meal.protein}g</span>
                    <span>Karbonhidrat: ${meal.carbs}g</span>
                    <span>Yağ: ${meal.fat}g</span>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    
    recommendationsContainer.innerHTML = html;
    
    // Önerileri uygula butonuna olay dinleyicisi ekle
    document.getElementById('apply-recommendations-btn').addEventListener('click', applyRecommendations);
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

// Önerileri uygula
async function applyRecommendations() {
    if (!recommendations || !recommendations.meals) {
        showError('Uygulanacak öneri bulunamadı.');
        return;
    }
    
    if (!confirm('Yapay zeka önerilerini bugünkü beslenme planınıza eklemek istediğinize emin misiniz?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        // API'ye önerileri uygula isteği gönder
        await apiService.applyNutritionRecommendations(selectedDate);
        
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

// Yiyecek öğesi ekle (Öğün formuna)
function addFoodItem() {
    const foodItemsContainer = document.getElementById('food-items');
    
    const foodItem = document.createElement('div');
    foodItem.className = 'food-item';
    
    foodItem.innerHTML = `
        <div class="form-group">
            <label>Yiyecek Adı</label>
            <input type="text" class="food-name" required>
        </div>
        <div class="form-group">
            <label>Porsiyon</label>
            <input type="text" class="food-portion" required>
        </div>
        <div class="form-group">
            <label>Kalori</label>
            <input type="number" class="food-calories" required>
        </div>
        <div class="form-group">
            <label>Protein (g)</label>
            <input type="number" class="food-protein" required>
        </div>
        <div class="form-group">
            <label>Karbonhidrat (g)</label>
            <input type="number" class="food-carbs" required>
        </div>
        <div class="form-group">
            <label>Yağ (g)</label>
            <input type="number" class="food-fat" required>
        </div>
        <button type="button" class="btn btn-outline-small remove-food">
            <i class="fas fa-trash"></i> Kaldır
        </button>
    `;
    
    foodItemsContainer.appendChild(foodItem);
    
    // Kaldır butonuna olay dinleyicisi ekle
    foodItem.querySelector('.remove-food').addEventListener('click', () => {
        foodItem.remove();
    });
}

// Öğün kaydet
async function saveMeal() {
    const mealType = document.getElementById('meal-type').value;
    const mealTime = document.getElementById('meal-time').value;
    
    // Öğün tipine göre isim belirle
    const mealNames = {
        breakfast: 'Kahvaltı',
        lunch: 'Öğle Yemeği',
        dinner: 'Akşam Yemeği',
        snack: 'Atıştırmalık'
    };
    
    // Yiyecekleri topla
    const foodItems = document.querySelectorAll('.food-item');
    const foods = [];
    
    foodItems.forEach(item => {
        const food = {
            name: item.querySelector('.food-name').value,
            portion: item.querySelector('.food-portion').value,
            calories: parseInt(item.querySelector('.food-calories').value) || 0,
            protein: parseInt(item.querySelector('.food-protein').value) || 0,
            carbs: parseInt(item.querySelector('.food-carbs').value) || 0,
            fat: parseInt(item.querySelector('.food-fat').value) || 0
        };
        
        foods.push(food);
    });
    
    if (foods.length === 0) {
        showError('En az bir yiyecek eklemelisiniz.');
        return;
    }
    
    // Öğün datasını oluştur
    const mealData = {
        date: selectedDate.toISOString(),
        type: mealType,
        name: mealNames[mealType] || 'Öğün',
        time: mealTime,
        foods: foods
    };
    
    showLoading(true);
    
    try {
        // API'ye öğün ekle isteği gönder
        await apiService.createMeal(mealData);
        
        // Modal'ı kapat
        document.getElementById('add-meal-modal').style.display = 'none';
        
        // Formu sıfırla
        document.getElementById('add-meal-form').reset();
        document.getElementById('food-items').innerHTML = '';
        addFoodItem(); // Varsayılan bir yiyecek alanı ekle
        
        // Verileri yenile
        await loadData();
        
        // Başarı mesajı
        alert('Öğün başarıyla eklendi!');
    } catch (error) {
        console.error('Öğün ekleme hatası:', error);
        showError('Öğün eklenirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
}

// Öğün düzenle
function editMeal(mealId) {
    alert(`${mealId} ID'li öğün düzenleme fonksiyonu henüz uygulanmadı.`);
}

// Öğün sil
async function deleteMeal(mealId) {
    if (!confirm('Bu öğünü silmek istediğinize emin misiniz?')) {
        return;
    }
    
    showLoading(true);
    
    try {
        // API'ye öğün silme isteği gönder
        await apiService.deleteMeal(mealId);
        
        // Verileri yenile
        await loadData();
        
        // Başarı mesajı
        alert('Öğün başarıyla silindi!');
    } catch (error) {
        console.error('Öğün silme hatası:', error);
        showError('Öğün silinirken bir hata oluştu.');
    } finally {
        showLoading(false);
    }
} 