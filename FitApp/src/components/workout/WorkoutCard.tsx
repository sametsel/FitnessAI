import React from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Exercise {
  name: string;
  sets?: number;
  reps?: number;
  weight?: number;
  restTime?: number;
  completed?: boolean;
}

interface WorkoutCardProps {
  id: string;
  name: string;
  type: string;
  difficulty: string;
  duration: number;
  completed: boolean;
  exercises: Exercise[];
  description?: string;
  onComplete?: (id: string) => void;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  id,
  name,
  type,
  difficulty,
  duration,
  completed,
  exercises,
  description,
  onComplete,
}) => {
  const getWorkoutTypeIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'kardiyo':
        return 'heart';
      case 'kuvvet':
        return 'dumbbell';
      case 'esneklik':
        return 'human-handsup';
      case 'hiit':
        return 'lightning-bolt';
      case 'pilates':
        return 'yoga';
      case 'yoga':
        return 'meditation';
      default:
        return 'dumbbell';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch ((difficulty || '').toLowerCase()) {
      case 'başlangıç':
        return theme.colors.success;
      case 'orta':
        return theme.colors.warning;
      case 'ileri':
        return theme.colors.danger;
      default:
        return theme.colors.text.secondary;
    }
  };

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
        colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,1)']}
        style={styles.gradient}
      >
        <Card.Content>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons 
                  name={getWorkoutTypeIcon(type)} 
                  size={24} 
                  color={theme.colors.primary} 
                />
              </View>
              <View style={styles.titleContent}>
                <Text style={styles.title}>{name}</Text>
                <Text style={styles.subtitle}>{type}</Text>
              </View>
            </View>
            <Chip 
              style={[styles.difficultyChip, { backgroundColor: getDifficultyColor(difficulty) + '20' }]}
              textStyle={{ color: getDifficultyColor(difficulty) }}
            >
              {difficulty}
            </Chip>
          </View>

          <View style={styles.details}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.detailText}>{duration} dk</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="dumbbell" size={16} color={theme.colors.text.secondary} />
              <Text style={styles.detailText}>{(exercises || []).length} egzersiz</Text>
            </View>
          </View>

          {description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionText}>{description}</Text>
            </View>
          )}

          <View style={styles.exercisesList}>
            {(exercises || []).map((exercise, index) => {
              const isCompleted = exercise.completed;
              const { icon, color } = getIconAndColor((exercise as any).type);
              return (
                <View
                  key={index}
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
                  <Text style={styles.exerciseMiniDesc}>{(exercise as any).muscleGroup || (exercise as any).targetMuscleGroups?.join(', ') || (exercise as any).description || '-'}</Text>
                  <View style={styles.exerciseChipsRow}>
                    <Chip style={[styles.chip, { backgroundColor: '#E3F2FD' }]}>Seviye: {(exercise as any).intensity || '-'}</Chip>
                    {(exercise as any).type === 'cardio' || (exercise as any).type === 'kardiyo' ? (
                      <Chip style={[styles.chip, { backgroundColor: '#FFECB3' }]}>⏱ {(exercise as any).duration || (exercise as any).sure || '-'} dk</Chip>
                    ) : (
                      <>
                        <Chip style={[styles.chip, { backgroundColor: '#E3F2FD' }]}>🔁 {(exercise as any).sets || (exercise as any).set || '-'} set</Chip>
                        <Chip style={[styles.chip, { backgroundColor: '#FFF3E0' }]}>🔢 {(exercise as any).reps || (exercise as any).tekrar || '-'} tekrar</Chip>
                      </>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

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

          {/* Modern ve büyük tamamla butonu */}
          {!completed && onComplete && (
            <TouchableOpacity
              style={styles.completeButtonModern}
              onPress={() => onComplete(id)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#38A169', '#48BB78']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.completeButtonGradient}
              >
                <MaterialCommunityIcons name="check-bold" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.completeButtonTextModern}>Antrenmanı Tamamladım</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {completed && (
            <View style={{ marginTop: 12, alignItems: 'center' }}>
              <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
              <Text style={{ color: theme.colors.success, fontWeight: 'bold', marginTop: 4 }}>Tamamlandı</Text>
            </View>
          )}
        </Card.Content>
      </LinearGradient>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    elevation: 3,
    backgroundColor: '#F0FDF4',
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContent: {
    marginLeft: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  difficultyChip: {
    height: 28,
  },
  details: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: theme.colors.background.default,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  detailText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  descriptionContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.colors.background.default,
    borderRadius: 8,
  },
  descriptionText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseMiniCard: {
    backgroundColor: '#F8FAFF',
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
  completeButtonModern: {
    marginTop: 18,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    width: '100%',
  },
  completeButtonTextModern: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 1,
  },
}); 