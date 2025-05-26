import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, Button, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export interface Exercise {
  name: string;
  type: string;
  sets?: number;
  reps?: number;
  duration?: number;
}

export interface TodayWorkoutProps {
  type?: string;
  completed?: boolean;
  exercises?: Exercise[];
  onStartWorkout?: () => void;
}

export const TodayWorkout: React.FC<TodayWorkoutProps> = ({
  type = 'Dinlenme Günü',
  completed = false,
  exercises = [],
}) => {
  // Gelen verileri console'a yazdır
  console.log('TodayWorkout props:', { type, completed, exercises });

  // Egzersiz tipine göre ikon ve renk seçici
  const getIconAndColor = (exerciseType: string) => {
    switch (exerciseType) {
      case 'kardiyo':
      case 'cardio':
        return { icon: 'run', color: '#FF9800' };
      case 'kuvvet':
      case 'strength':
        return { icon: 'arm-flex', color: '#3F51B5' };
      case 'esneme':
      case 'stretch':
        return { icon: 'yoga', color: '#4CAF50' };
      case 'pilates':
        return { icon: 'yoga', color: '#9C27B0' };
      default:
        return { icon: 'dumbbell', color: '#607D8B' };
    }
  };

  // Motivasyon mesajları
  const motivationMessages = [
    'Harika iş çıkardın! Devam et!',
    'Süpersin! Her gün daha iyiye!',
    'Tebrikler, hedeflerine bir adım daha yaklaştın!',
    'Enerjin çok iyi, aynen devam!',
    'Vazgeçme, başarıya çok yakınsın!'
  ];
  const randomMsg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];

  return (
    <Card style={styles.card}>
      <LinearGradient
        colors={['#38A169', '#48BB78']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.cardHeaderGradient}
      >
        <View style={styles.cardHeaderContent}>
          <FontAwesome5 name="dumbbell" size={20} color="white" />
          <Text style={styles.cardHeaderTitle}>{type}</Text>
        </View>
      </LinearGradient>
      <Card.Content style={styles.workoutCardContent}>
        <View style={styles.workoutDetails}>
          <Chip 
            icon={completed ? "check" : "clock"}
            style={{
              backgroundColor: completed ? '#4CAF5033' : '#FF980033'
            }}
          >
            {completed ? 'Tamamlandı' : 'Planlandı'}
          </Chip>
        </View>
        {Array.isArray(exercises) && exercises.length > 0 ? (
          <View style={styles.exercisesContainer}>
            {exercises.map((exercise: any, idx: number) => {
              const isCompleted = exercise.completed;
              const { icon, color } = getIconAndColor(exercise.type);
              return (
                <View
                  key={idx}
                  style={[
                    styles.exerciseMiniCard,
                    isCompleted && styles.exerciseMiniCardCompleted,
                  ]}
                >
                  <View style={styles.exerciseMiniHeader}>
                    <MaterialCommunityIcons
                      name={icon as any}
                      size={22}
                      color={color}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.exerciseMiniTitle}>{exercise.name}</Text>
                    {isCompleted && (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" style={{ marginLeft: 6 }} />
                    )}
                  </View>
                  <Text style={styles.exerciseMiniDesc}>{exercise.muscleGroup || exercise.targetMuscleGroups?.join(', ') || exercise.description || '-'}</Text>
                  <View style={styles.exerciseChipsRow}>
                    <Chip style={[styles.chip, { backgroundColor: '#E3F2FD' }]}>Seviye: {exercise.intensity || '-'}</Chip>
                    {exercise.type === 'cardio' || exercise.type === 'kardiyo' ? (
                      <Chip style={[styles.chip, { backgroundColor: '#FFECB3' }]}>⏱ {exercise.duration || exercise.sure || '-'} dk</Chip>
                    ) : (
                      <>
                        <Chip style={[styles.chip, { backgroundColor: '#E3F2FD' }]}>🔁 {exercise.sets || exercise.set || '-'} set</Chip>
                        <Chip style={[styles.chip, { backgroundColor: '#FFF3E0' }]}>🔢 {exercise.reps || exercise.tekrar || '-'} tekrar</Chip>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noWorkoutMessage}>
            {type === 'Dinlenme Günü' ? 'Bugün dinlenme günü' : 'Henüz egzersiz eklenmemiş'}
          </Text>
        )}
        {/* Motivasyon mesajı */}
        <View style={styles.motivationContainer}>
          <LinearGradient
            colors={['#FF9800', '#4CAF50']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.motivationGradient}
          >
            <Text style={styles.motivationText}>{randomMsg}</Text>
          </LinearGradient>
        </View>
        {/* Büyük gradientli buton örneği (isteğe bağlı) */}
        {/*
        <TouchableOpacity style={styles.bigButton}>
          <LinearGradient
            colors={['#38A169', '#48BB78']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.bigButtonGradient}
          >
            <Text style={styles.bigButtonText}>Motivasyonunu Koru!</Text>
          </LinearGradient>
        </TouchableOpacity>
        */}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardHeaderGradient: {
    padding: 15,
  },
  cardHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  workoutCardContent: {
    paddingVertical: 15,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exercisesContainer: {
    marginTop: 10,
  },
  exerciseMiniCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseMiniCardCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  exerciseMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  exerciseMiniTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  exerciseMiniDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    marginTop: 2,
  },
  exerciseChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 8,
    fontWeight: 'bold',
  },
  noWorkoutMessage: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  motivationContainer: {
    marginTop: 18,
    marginBottom: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  motivationGradient: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  motivationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
  bigButton: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bigButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  bigButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
}); 