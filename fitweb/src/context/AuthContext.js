import { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Sayfa yüklendiğinde token kontrolü
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile();
        }
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await apiService.getProfile();
            setUser(response.user);
            setError(null);
        } catch (err) {
            setError(err.message);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await apiService.loginUser(credentials);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (userData) => {
        try {
            setLoading(true);
            const response = await apiService.registerUser(userData);
            setUser(response.user);
            localStorage.setItem('token', response.token);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (userData) => {
        try {
            setLoading(true);
            const response = await apiService.updateProfile(userData);
            setUser(response.user);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            loading, 
            error, 
            login, 
            register, 
            logout,
            updateProfile,
            fetchProfile
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext); 