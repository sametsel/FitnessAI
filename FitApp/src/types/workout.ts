export interface Exercise {
  id: string;
  name: string;
  description: string;
  muscleGroup: string;
  equipment: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoUrl?: string;
  imageUrl?: string;
  instructions: string[];
  sets?: number;
  reps?: number;
  duration?: number; // dakika cinsinden
  calories?: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: {
    exercise: Exercise;
    sets: number;
    reps: number;
    duration?: number;
    restBetweenSets: number; // saniye cinsinden
  }[];
  dayNumber: number;
  completed: boolean;
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'mixed';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // hafta cinsinden
  days: WorkoutDay[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  targetMuscleGroups: string[];
  equipment: string[];
  goals: string[];
  completed: boolean;
  progress: number; // yüzde cinsinden
} 