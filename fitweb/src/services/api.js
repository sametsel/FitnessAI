// API URL'sini geliştirme ortamına göre ayarla
const DEV_API_URL = 'http://192.168.98.198:5000/api';
const PROD_API_URL = 'https://api.fitapp.com/api'; // Prodüksiyon URL'si

export const API_URL = DEV_API_URL; // Geliştirme ortamında DEV_API_URL kullan

const TOKEN_KEY = '@fitapp_token';
const USER_KEY = '@fitapp_user';

// Token yönetimi
const getToken = () => localStorage.getItem(TOKEN_KEY);
const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
};

// Token geçerliliğini kontrol et
const isTokenValid = (token) => {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

// Auth header'ı oluştur
const getAuthHeader = () => {
    const token = getToken();
    if (!token || !isTokenValid(token)) {
        clearToken();
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Kullanıcı profil bilgilerini getirir
 * @returns {Promise<Object>} Kullanıcı bilgileri
 */
async function getUserProfile() {
    try {
        console.log('getUserProfile çağrıldı');
        
        const headers = {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
        };
        
        console.log('API URL:', `${API_URL}/users/profile`);
        console.log('Headers:', headers);

        const response = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers
        });

        console.log('API yanıt durumu:', response.status);
        
        if (!response.ok) {
            throw new Error(`Profil bilgileri alınamadı: ${response.status}`);
        }

        const data = await response.json();
        console.log('API yanıt verisi:', data);
        
        if (!data.success) {
            throw new Error(data.message || 'Profil bilgileri alınamadı');
        }

        return data.user;
    } catch (error) {
        console.error('Profil bilgileri alınırken hata:', error);
        throw error;
    }
}

export const apiService = {
    // Kullanıcı işlemleri
    async register(userData) {
        try {
            console.log('Kayıt isteği gönderiliyor:', userData);
            const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Kayıt işlemi başarısız');
            }
            
            if (data.token && isTokenValid(data.token)) {
                setToken(data.token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            } else {
                throw new Error('Geçersiz token alındı');
            }
            
            return data;
        } catch (error) {
            console.error('Kayıt hatası:', error);
            clearToken();
            throw error;
        }
    },

    async login(email, password) {
        try {
            clearToken();
            console.log('Login isteği gönderiliyor:', { email });
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Giriş işlemi başarısız');
            }
            
            if (data.token && isTokenValid(data.token)) {
                setToken(data.token);
                if (data.user) {
                    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
                }
                return data;
            } else {
                throw new Error('Geçersiz token alındı');
            }
        } catch (error) {
            console.error('Login hatası:', error);
            clearToken();
            throw error;
        }
    },

    async getProfile() {
        try {
            const response = await fetch(`${API_URL}/users/profile`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Profil bilgileri alınamadı');
            }
            
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Profil bilgileri alma hatası:', error);
            throw error;
        }
    },

    async updateProfile(userData) {
        try {
            console.log('Profil güncelleme isteği gönderiliyor:', userData);
            const response = await fetch(`${API_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Profil güncellenemedi');
            }
            
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            return data.user;
        } catch (error) {
            console.error('Profil güncelleme hatası:', error);
            throw error;
        }
    },

    // Beslenme programı
    async getNutrition(date) {
        try {
            const dateParam = date ? `?date=${date.toISOString()}` : '';
            const response = await fetch(`${API_URL}/nutrition${dateParam}`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Beslenme bilgileri alınamadı');
            }
            
            return data.data;
        } catch (error) {
            console.error('Beslenme bilgileri alma hatası:', error);
            throw error;
        }
    },

    async getTodayNutrition() {
        return this.getNutrition(new Date());
    },

    // Egzersiz programı
    async getWorkouts(startDate, endDate) {
        try {
            let url = `${API_URL}/workouts`;
            
            // Tarih parametreleri varsa ekle
            if (startDate || endDate) {
                const params = new URLSearchParams();
                if (startDate) params.append('startDate', startDate.toISOString());
                if (endDate) params.append('endDate', endDate.toISOString());
                url += `?${params.toString()}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman bilgileri alınamadı');
            }
            
            return data.data.workouts;
        } catch (error) {
            console.error('Antrenman bilgileri alma hatası:', error);
            throw error;
        }
    },

    async getTodayWorkout() {
        try {
            const response = await fetch(`${API_URL}/workouts/today`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Günlük antrenman bilgisi alınamadı');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Günlük antrenman alma hatası:', error);
            throw error;
        }
    },

    async getNextWorkout() {
        try {
            const response = await fetch(`${API_URL}/workouts/next`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Sonraki antrenman bilgisi alınamadı');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Sonraki antrenman alma hatası:', error);
            throw error;
        }
    },

    async createWorkout(workoutData) {
        try {
            const response = await fetch(`${API_URL}/workouts`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutData),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman oluşturulamadı');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Antrenman oluşturma hatası:', error);
            throw error;
        }
    },

    async updateWorkout(id, workoutData) {
        try {
            const response = await fetch(`${API_URL}/workouts/${id}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(workoutData),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman güncellenemedi');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Antrenman güncelleme hatası:', error);
            throw error;
        }
    },

    async completeWorkout(id) {
        try {
            const response = await fetch(`${API_URL}/workouts/${id}/complete`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman tamamlanamadı');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Antrenman tamamlama hatası:', error);
            throw error;
        }
    },

    async addExercise(workoutId, exerciseData) {
        try {
            const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises`, {
                method: 'POST',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exerciseData),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Egzersiz eklenemedi');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Egzersiz ekleme hatası:', error);
            throw error;
        }
    },

    async updateExercise(workoutId, exerciseId, exerciseData) {
        try {
            const response = await fetch(`${API_URL}/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(exerciseData),
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Egzersiz güncellenemedi');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Egzersiz güncelleme hatası:', error);
            throw error;
        }
    },

    async getWorkoutStats() {
        try {
            const response = await fetch(`${API_URL}/workouts/stats`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'İstatistikler alınamadı');
            }
            
            return data.data;
        } catch (error) {
            console.error('İstatistikler alma hatası:', error);
            throw error;
        }
    },

    async getNutritionStats() {
        try {
            const response = await fetch(`${API_URL}/nutrition/stats`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Beslenme istatistikleri alınamadı');
            }
            
            return data.data;
        } catch (error) {
            console.error('Beslenme istatistikleri alma hatası:', error);
            throw error;
        }
    },

    async getNutritionRecommendation(date) {
        try {
            const dateParam = date ? `?date=${date.toISOString()}` : '';
            const response = await fetch(`${API_URL}/nutrition/recommendation${dateParam}`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Beslenme önerileri alınamadı');
            }
            
            return data.data;
        } catch (error) {
            console.error('Beslenme önerileri alma hatası:', error);
            throw error;
        }
    },

    async getWorkoutRecommendation() {
        try {
            const response = await fetch(`${API_URL}/workouts/recommendation`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman önerileri alınamadı');
            }
            
            return data.data;
        } catch (error) {
            console.error('Antrenman önerileri alma hatası:', error);
            throw error;
        }
    },

    async applyWorkoutRecommendations(workoutId) {
        try {
            const response = await fetch(`${API_URL}/workouts/${workoutId}/apply-recommendations`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Antrenman önerileri uygulanamadı');
            }
            
            return data.data.workout;
        } catch (error) {
            console.error('Antrenman önerileri uygulama hatası:', error);
            throw error;
        }
    },

    // Oturum kontrolü
    async checkAuth() {
        try {
            const token = getToken();
            
            // Token yoksa veya geçersizse
            if (!token || !isTokenValid(token)) {
                clearToken();
                return {
                    isAuthenticated: false,
                    user: null
                };
            }

            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            if (!data.success) {
                clearToken();
                return {
                    isAuthenticated: false,
                    user: null
                };
            }

            // Kullanıcı bilgilerini güncelle
            if (data.user) {
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            
            return {
                isAuthenticated: true,
                user: data.user
            };
        } catch (error) {
            console.error('Oturum kontrolü hatası:', error);
            clearToken();
            return {
                isAuthenticated: false,
                user: null
            };
        }
    },

    // Çıkış yap
    logout() {
        clearToken();
        return true;
    },

    getUserProfile,
}; 