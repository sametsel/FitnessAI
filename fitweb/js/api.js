const API_URL = 'http://localhost:3000/api';

// Axios instance oluştur
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - token süresi dolduğunda
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/pages/login.html';
        }
        return Promise.reject(error);
    }
);

// Auth işlemleri
const auth = {
    // Kayıt ol
    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Giriş yap
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            localStorage.setItem('token', response.data.token);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Çıkış yap
    logout: () => {
        localStorage.removeItem('token');
        window.location.href = '../index.html';
    },

    // Profil verisi çekme
    getProfile: async () => {
        try {
            const response = await api.get('/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Profil güncelleme
    updateProfile: async (profileData) => {
        try {
            const response = await api.put('/profile', profileData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
};

export { auth as authAPI }; 