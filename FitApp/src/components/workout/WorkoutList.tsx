import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WorkoutCard } from './WorkoutCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';

interface WorkoutListProps {
  workouts: any[];
  onAddWorkout?: () => void;
  onComplete?: (id: string) => void;
}

const getWorkoutKey = (workout: any, idx: number) => {
  if (workout._id) return `workout-${workout._id}`;
  if (workout.id) return `workout-${workout.id}`;
  return `workout-${workout.date || 'no-date'}-${workout.name || 'no-name'}-${idx}`;
};

export const WorkoutList: React.FC<WorkoutListProps> = ({ workouts, onAddWorkout, onComplete }) => {
  if (!workouts || workouts.length === 0) {
    return (
      <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 32 }}>
        <MaterialCommunityIcons name="dumbbell" size={48} color={theme.colors.primary} style={{ marginBottom: 12, opacity: 0.7 }} />
        <Text style={{ color: theme.colors.text.secondary, fontSize: 16, marginBottom: 12, textAlign: 'center' }}>
          Bugün için planlı bir antrenman bulunamadı.
        </Text>
        {onAddWorkout && (
          <TouchableOpacity
            style={{ backgroundColor: theme.colors.primary, borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 }}
            onPress={onAddWorkout}
          >
            <Text style={{ color: theme.colors.white, fontWeight: 'bold', fontSize: 16 }}>Yeni Antrenman Ekle</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  return (
    <View style={{ marginBottom: 16 }}>
      {workouts.map((workout, idx) => (
        <WorkoutCard
          key={getWorkoutKey(workout, idx)}
          id={workout._id || workout.id || `idx-${idx}`}
          name={workout.name}
          type={workout.type}
          difficulty={workout.difficulty}
          duration={workout.duration}
          completed={workout.completed}
          exercises={workout.exercises}
          description={workout.description || workout.notes || ''}
          onComplete={onComplete}
        />
      ))}
    </View>
  );
}; 