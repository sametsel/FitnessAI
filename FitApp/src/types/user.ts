export interface User {
    _id: string;
    email: string;
    name: string;
    age?: number;
    weight?: number;
    height?: number;
    gender?: 'male' | 'female' | 'other';
    fitnessGoals?: string[];
    activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    medicalConditions?: string[];
    allergies?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface UserWithoutPassword extends Omit<User, 'password'> {} 