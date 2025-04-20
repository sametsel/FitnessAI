import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { FitnessProvider } from './context/FitnessContext';
import AppRouter from './router/AppRouter';

function App() {
    return (
        <AuthProvider>
            <FitnessProvider>
                <AppRouter />
            </FitnessProvider>
        </AuthProvider>
    );
}

export default App; 