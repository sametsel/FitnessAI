// API URL'sini geliştirme ortamına göre ayarla
const DEV_API_URL = 'http://192.168.1.101:5000/api';
const PROD_API_URL = 'https://api.fitapp.com/api'; // Prodüksiyon URL'si

export const API_URL = DEV_API_URL; // Geliştirme ortamında DEV_API_URL kullan

const TOKEN_KEY = '@fitapp_token';
const USER_KEY = '@fitapp_user';

// Token yönetimi için yardımcı fonksiyonlar
const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};

const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};

const clearToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

const getAuthHeader = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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
            
            if (data.token) {
                setToken(data.token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
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
            
            if (data.token) {
                setToken(data.token);
                localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
            
            return data;
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
            const response = await fetch(`${API_URL}/auth/verify`, {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json',
                },
            });
            
            const data = await response.json();
            
            return {
                isAuthenticated: data.success,
                user: data.user || null
            };
        } catch (error) {
            console.error('Oturum kontrolü hatası:', error);
            return {
                isAuthenticated: false,
                user: null
            };
        }
    },

    // Çıkış yap
    logout() {
        clearToken();
        localStorage.removeItem(USER_KEY);
        return true;
    }
}; 