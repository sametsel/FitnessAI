const API_BASE_URL = 'http://localhost:5000/api';

// Token yönetimi için yardımcı fonksiyonlar
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiService = {
    // Kullanıcı işlemleri
    async registerUser(userData) {
        const response = await fetch(`${API_BASE_URL}/users/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    async loginUser(credentials) {
        const response = await fetch(`${API_BASE_URL}/users/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
        return response.json();
    },

    async getProfile() {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    async updateProfile(userData) {
        const response = await fetch(`${API_BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    },

    // Beslenme programı
    async getNutritionPlan() {
        const response = await fetch(`${API_BASE_URL}/nutrition/plan`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    // Egzersiz programı
    async getExercisePlan() {
        const response = await fetch(`${API_BASE_URL}/exercise/plan`, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
        });
        return response.json();
    },

    // Yapay zeka önerileri
    async getAIRecommendations(userData) {
        const response = await fetch(`${API_BASE_URL}/ai/recommendations`, {
            method: 'POST',
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });
        return response.json();
    }
}; 