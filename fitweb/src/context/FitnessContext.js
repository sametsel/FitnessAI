import { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from './AuthContext';

const FitnessContext = createContext();

export const FitnessProvider = ({ children }) => {
    const [nutritionPlan, setNutritionPlan] = useState(null);
    const [exercisePlan, setExercisePlan] = useState(null);
    const [aiRecommendations, setAIRecommendations] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    // Kullanıcı değiştiğinde planları yenile
    useEffect(() => {
        if (user) {
            fetchPlans();
        }
    }, [user]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const [nutrition, exercise] = await Promise.all([
                apiService.getNutritionPlan(),
                apiService.getExercisePlan()
            ]);
            setNutritionPlan(nutrition);
            setExercisePlan(exercise);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAIRecommendations = async (userData) => {
        try {
            setLoading(true);
            const recommendations = await apiService.getAIRecommendations(userData);
            setAIRecommendations(recommendations);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <FitnessContext.Provider value={{
            nutritionPlan,
            exercisePlan,
            aiRecommendations,
            loading,
            error,
            fetchPlans,
            fetchAIRecommendations
        }}>
            {children}
        </FitnessContext.Provider>
    );
};

export const useFitness = () => useContext(FitnessContext); 