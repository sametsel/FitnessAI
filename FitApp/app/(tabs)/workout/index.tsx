import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ViewStyle, RefreshControl, Animated, Platform } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/theme/theme';
import { StyleGuide } from '../../../src/styles/StyleGuide';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../../src/services/api';
import { Workout } from '../../../src/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { LinearGradient } from 'expo-linear-gradient';

// Geliştirilmiş LinearProgress bileşeni
const LinearProgress: React.FC<{
  progress: number;
  color?: string;
  trackColor?: string;
  style?: ViewStyle;
  key?: string;
  animated?: boolean;
}> = ({
  progress,
  color = theme.colors.primary,
  trackColor = theme.colors.gray200,
  style,
  key,
  animated = true,
}) => {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const [widthAnimation] = useState(new Animated.Value(0));
  
  useEffect(() => {
    if (animated) {
      Animated.timing(widthAnimation, {
        toValue: safeProgress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      widthAnimation.setValue(safeProgress);
    }
  }, [safeProgress, animated]);
  
  return (
    <View key={key} style={[{ width: '100%', overflow: 'hidden' }, style]}>
      <View style={[
        { height: 8, borderRadius: 4, width: '100%' },
        { backgroundColor: trackColor }
      ]}>
        <Animated.View
          style={[
            { height: '100%', borderRadius: 4 },
            {
              backgroundColor: color,
              width: animated 
                ? widthAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }) 
                : `${safeProgress * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

// Workout tipi ile uyumlu bir interface
interface ExtendedWorkout {
  id: string;
  _id: string; // id ile aynı değeri taşıyacak
  userId: string;
  date: string | Date; // string veya Date olabilir
  type: string;
  duration: number;
  name: string;
  difficulty: string;
  completedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  exercises: ExtendedExercise[];
  completed: boolean;
}

interface ExtendedExercise {
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  restTime?: number;
  completed?: boolean;
}

export default function WorkoutScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<ExtendedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<{[key: string]: boolean}>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<{[date: string]: any}>({});
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    completedWorkouts: 0,
    streakDays: 0,
    totalExercises: 0
  });

  useEffect(() => {
    fetchWorkouts();
    fetchWorkoutStats();
    setGreetingMessage();
    generateMarkedDates();
  }, []);

  const setGreetingMessage = () => {
    const currentHour = new Date().getHours();
    let message = '';
    
    if (currentHour < 12) {
      message = 'Günaydın';
    } else if (currentHour < 18) {
      message = 'İyi günler';
    } else {
      message = 'İyi akşamlar';
    }
    
    setGreeting(`${message}, ${user?.name?.split(' ')[0] || 'Sporcu'}!`);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWorkouts();
    setRefreshing(false);
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      // Kullanıcı ID'sini doğru şekilde al, _id veya id alanını kontrol et
      const userId = user?._id || user?.id || '';
      
      if (!userId) {
        console.error('Kullanıcı kimliği bulunamadı:', user);
        setError('Kullanıcı bilgisi bulunamadı. Lütfen yeniden giriş yapın.');
        setLoading(false);
        return;
      }
      
      console.log('Antrenmanlar yüklenirken kullanılan userId:', userId);
      
      // userId parametresi eklendi
      const fetchedWorkouts = await api.getWorkouts(userId);
      
      // Workout tiplerini ExtendedWorkout tipine dönüştür
      const extendedWorkouts = fetchedWorkouts.map(workout => {
        return {
          ...workout,
          _id: workout.id, // id'yi _id'ye kopyala
          name: workout.type, // Geçici olarak tip adını kullanıyoruz
          difficulty: 'orta', // Default değer
          createdAt: new Date(),
          updatedAt: new Date(),
          exercises: workout.exercises.map(ex => ({
            ...ex,
            completed: false
          }))
        } as ExtendedWorkout;
      });
      
      setWorkouts(extendedWorkouts);
      setError(null);
    } catch (err) {
      setError('Antrenmanlar yüklenirken bir hata oluştu');
      console.error('Antrenman yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExercises = (workoutId: string) => {
    setExpandedExercises(prev => ({
      ...prev,
      [workoutId]: !prev[workoutId]
    }));
  };

  const toggleWorkout = (workoutId: string) => {
    setExpandedWorkout(expandedWorkout === workoutId ? null : workoutId);
  };

  const filterWorkouts = (filter: string | null) => {
    setActiveFilter(filter);
  };

  const getFilteredWorkouts = () => {
    if (!activeFilter) return workouts;
    
    return workouts.filter(workout => {
      switch(activeFilter) {
        case 'completed': return workout.completed;
        case 'upcoming': return !workout.completed;
        case 'kardiyo': return workout.type === 'kardiyo';
        case 'kuvvet': return workout.type === 'kuvvet';
        default: return true;
      }
    });
  };

  const getWorkoutTypeIcon = (type: string) => {
    switch (type) {
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
    switch (difficulty) {
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

  const calculateProgress = (workout: ExtendedWorkout) => {
    if (!workout.completedAt) return 0;
    
    // Basit bir hesaplama olarak tamamlanan egzersiz sayısını kullan
    const completedExercises = workout.exercises.filter(e => e.completed).length;
    return (completedExercises / workout.exercises.length) * 100;
  };

  const getDaysLeft = (workout: ExtendedWorkout) => {
    const today = new Date();
    const workoutDate = new Date(workout.date);
    
    // Geçmişte kaldıysa 0 gün kaldı göster
    if (workoutDate < today) return 0;
    
    const timeDiff = workoutDate.getTime() - today.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return dayDiff;
  };

  // İstatistikleri getir
  const fetchWorkoutStats = async () => {
    try {
      // API'den gerçek veri gelene kadar örnek veri kullanalım
      setWorkoutStats({
        totalWorkouts: 15,
        completedWorkouts: 8,
        streakDays: 4,
        totalExercises: 35
      });
      
      // Gerçek implementasyon:
      // const stats = await api.getWorkoutStats(user?._id || user?.id || '');
      // setWorkoutStats(stats);
    } catch (err) {
      console.error('İstatistik yükleme hatası:', err);
    }
  };

  // Takvim için işaretli tarihleri oluştur
  const generateMarkedDates = () => {
    const today = new Date().toISOString().split('T')[0];
    const dates: {[date: string]: any} = {
      [today]: { 
        selected: true, 
        selectedColor: theme.colors.primary,
        marked: true
      }
    };
    
    // Örnek veri - Gerçek verilerle değiştirilmeli
    const next7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);
      return date.toISOString().split('T')[0];
    });
    
    // Gelecekteki antrenmanlar için
    next7Days.forEach((date, i) => {
      if (i % 2 === 0) { // Sadece örnek olarak her iki günde bir antrenman
        dates[date] = { 
          marked: true, 
          dotColor: theme.colors.primary,
          activeOpacity: 0.5
        };
      }
    });
    
    // Geçmiş tamamlanmış antrenmanlar için
    const past7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i - 1);
      return date.toISOString().split('T')[0];
    });
    
    past7Days.forEach((date, i) => {
      if (i % 3 === 0) { // Örnek olarak
        dates[date] = { 
          marked: true, 
          dotColor: theme.colors.success
        };
      }
    });
    
    setMarkedDates(dates);
    setSelectedDate(today);
  };
  
  // Takvimde tarih seçildiğinde
  const onDayPress = (day: {dateString: string}) => {
    setSelectedDate(day.dateString);
    setCalendarVisible(false);
    // Burada seçilen tarihe göre antrenmanları filtreleyebiliriz
  };

  // Antrenman tamamlama
  const completeWorkout = async (workoutId: string) => {
    try {
      // TODO: Gerçek API çağrısı eklenecek
      // await api.completeWorkout(workoutId);
      
      // Şimdilik yerel state'i güncelle
      setWorkouts(prev => 
        prev.map(w => 
          w._id === workoutId 
            ? {...w, completed: true, completedAt: new Date()} 
            : w
        )
      );
      
      // İstatistikleri güncelle
      setWorkoutStats(prev => ({
        ...prev,
        completedWorkouts: prev.completedWorkouts + 1
      }));
      
    } catch (err) {
      console.error('Antrenman tamamlama hatası:', err);
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Antrenmanlar yükleniyor...</Text>
      </View>
    );
  }

  const filteredWorkouts = getFilteredWorkouts();

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={['#00adf5', '#0088cc']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>{greeting}</Text>
            <Text style={styles.nameText}>{user?.name?.split(' ')[0] || 'Sporcu'}</Text>
          </View>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setCalendarVisible(!calendarVisible)}
          >
            <MaterialCommunityIcons name="calendar-month" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>
      
      {calendarVisible && (
        <View style={styles.calendarContainer}>
          <Calendar
            markedDates={markedDates}
            onDayPress={onDayPress}
            theme={{
              calendarBackground: theme.colors.white,
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: theme.colors.white,
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text.primary,
              textDisabledColor: theme.colors.gray300,
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.text.primary,
              indicatorColor: theme.colors.primary
            }}
          />
        </View>
      )}
      
      {/* İstatistik Kartları */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScrollView}
      >
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, {backgroundColor: `${theme.colors.success}20`}]}>
            <MaterialCommunityIcons name="dumbbell" size={18} color={theme.colors.success} />
          </View>
          <View>
            <Text style={styles.statValue}>{workoutStats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Toplam Antrenman</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, {backgroundColor: `${theme.colors.primary}20`}]}>
            <MaterialCommunityIcons name="check-circle" size={18} color={theme.colors.primary} />
          </View>
          <View>
            <Text style={styles.statValue}>{workoutStats.completedWorkouts}</Text>
            <Text style={styles.statLabel}>Tamamlanan</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, {backgroundColor: `${theme.colors.warning}20`}]}>
            <MaterialCommunityIcons name="fire" size={18} color={theme.colors.warning} />
          </View>
          <View>
            <Text style={styles.statValue}>{workoutStats.streakDays}</Text>
            <Text style={styles.statLabel}>Seri Gün</Text>
          </View>
        </View>
        
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, {backgroundColor: `${theme.colors.accent}20`}]}>
            <FontAwesome5 name="running" size={18} color={theme.colors.accent} />
          </View>
          <View>
            <Text style={styles.statValue}>{workoutStats.totalExercises}</Text>
            <Text style={styles.statLabel}>Toplam Egzersiz</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.filterSection}>
        <Text key="workouts-title" style={styles.title}>Antrenmanlarım</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filtersContainer}
        >
          <TouchableOpacity 
            key="workout-filter-all"
            style={[styles.filterChip, activeFilter === null && styles.activeFilterChip]} 
            onPress={() => filterWorkouts(null)}
          >
            <Text style={[styles.filterChipText, activeFilter === null && styles.activeFilterChipText]}>Tümü</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            key="workout-filter-completed"
            style={[styles.filterChip, activeFilter === 'completed' && styles.activeFilterChip]} 
            onPress={() => filterWorkouts('completed')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'completed' && styles.activeFilterChipText]}>Tamamlanan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            key="workout-filter-upcoming"
            style={[styles.filterChip, activeFilter === 'upcoming' && styles.activeFilterChip]} 
            onPress={() => filterWorkouts('upcoming')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'upcoming' && styles.activeFilterChipText]}>Yaklaşan</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            key="workout-filter-kardiyo"
            style={[styles.filterChip, activeFilter === 'kardiyo' && styles.activeFilterChip]} 
            onPress={() => filterWorkouts('kardiyo')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'kardiyo' && styles.activeFilterChipText]}>Kardiyo</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            key="workout-filter-kuvvet"
            style={[styles.filterChip, activeFilter === 'kuvvet' && styles.activeFilterChip]} 
            onPress={() => filterWorkouts('kuvvet')}
          >
            <Text style={[styles.filterChipText, activeFilter === 'kuvvet' && styles.activeFilterChipText]}>Kuvvet</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      {error && (
        <View key="error-container" style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button key="retry-button" title="Tekrar Dene" onPress={fetchWorkouts} />
        </View>
      )}
      
      {filteredWorkouts.length === 0 ? (
        <View key="empty-workout-container" style={styles.cardShadow}>
          <Card style={styles.emptyCard}>
            <MaterialCommunityIcons key="empty-icon" name="dumbbell" size={48} color={theme.colors.primary} style={styles.emptyIcon} />
            <Text key="empty-text" style={styles.emptyText}>
              {activeFilter ? 'Bu filtreye uygun antrenman bulunamadı' : 'Henüz antrenman eklenmemiş'}
            </Text>
            <Button 
              key="add-workout-button"
              title="Yeni Antrenman Ekle" 
              onPress={() => {/* TODO: Yeni antrenman ekleme sayfasına yönlendir */}} 
              style={styles.addButton}
            />
          </Card>
        </View>
      ) : (
        filteredWorkouts.map((workout, workoutIndex) => (
          <View key={`workout-${workout._id}-${workoutIndex}`} style={styles.cardShadow}>
            <Card style={styles.workoutCard}>
              <TouchableOpacity 
                key={`workout-header-${workout._id}`}
                style={styles.workoutHeader} 
                onPress={() => toggleWorkout(workout._id)}
              >
                <View key={`workout-info-${workout._id}`} style={styles.workoutInfo}>
                  <View key={`workout-icon-${workout._id}`} style={[styles.iconCircle, { backgroundColor: `${getWorkoutTypeColor(workout.type)}20` }]}>
                    <MaterialCommunityIcons 
                      key={`workout-icon-material-${workout._id}`}
                      name={getWorkoutTypeIcon(workout.type)} 
                      size={24} 
                      color={getWorkoutTypeColor(workout.type)} 
                    />
                  </View>
                  <View key={`workout-title-${workout._id}`} style={styles.workoutTitleContainer}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutType}>{workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</Text>
                  </View>
                </View>
                <View key={`workout-difficulty-${workout._id}`} style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workout.difficulty) }]}>
                  <Text style={styles.difficultyText}>{workout.difficulty}</Text>
                </View>
              </TouchableOpacity>

              <View key={`progress-section-${workout._id}`} style={styles.progressSection}>
                <View key={`progress-label-container-${workout._id}`} style={styles.progressLabelContainer}>
                  <Text key={`progress-label-${workout._id}`} style={styles.progressLabel}>İlerleme</Text>
                  <Text key={`progress-percent-${workout._id}`} style={styles.progressPercent}>{Math.round(calculateProgress(workout))}%</Text>
                </View>
                <LinearProgress 
                  key={`${workout._id}-progress`}
                  progress={calculateProgress(workout) / 100} 
                  color={theme.colors.primary}
                  trackColor={theme.colors.gray200}
                  style={styles.progressBar}
                />
              </View>

              <View key={`workout-details-${workout._id}`} style={styles.workoutDetails}>
                <View key={`${workout._id}-duration`} style={styles.detailChip}>
                  <MaterialCommunityIcons name="clock-outline" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>{workout.duration} dk</Text>
                </View>
                
                <View key={`${workout._id}-exercises`} style={styles.detailChip}>
                  <MaterialCommunityIcons name="dumbbell" size={16} color={theme.colors.text.secondary} />
                  <Text style={styles.detailText}>{workout.exercises.length} egzersiz</Text>
                </View>
                
                {!workout.completed && (
                  <View key={`${workout._id}-days`} style={styles.detailChip}>
                    <MaterialCommunityIcons name="calendar-today" size={16} color={theme.colors.text.secondary} />
                    <Text style={styles.detailText}>{getDaysLeft(workout)} gün kaldı</Text>
                  </View>
                )}
              </View>

              {expandedWorkout === workout._id && (
                <React.Fragment key={`${workout._id}-expanded`}>
                  <View key={`${workout._id}-separator`} style={styles.separator} />

                  <TouchableOpacity 
                    key={`${workout._id}-header`}
                    style={styles.exercisesHeader}
                    onPress={() => toggleExercises(workout._id)}
                  >
                    <Text style={styles.exercisesHeaderText}>Egzersizler</Text>
                    <MaterialCommunityIcons 
                      name={expandedExercises[workout._id] ? "chevron-up" : "chevron-down"} 
                      size={24} 
                      color={theme.colors.text.secondary} 
                    />
                  </TouchableOpacity>

                  {expandedExercises[workout._id] && (
                    <View key={`${workout._id}-exercises-list`} style={styles.exercisesList}>
                      {workout.exercises.map((exercise, index) => (
                        <View key={`${workout._id}-exercise-${index}`} style={styles.exerciseItem}>
                          <View style={styles.exerciseHeaderContainer}>
                            <Text style={styles.exerciseName}>{exercise.name}</Text>
                            {exercise.completed ? (
                              <View style={styles.completedBadge}>
                                <MaterialCommunityIcons name="check" size={12} color="#fff" />
                                <Text style={styles.completedText}>Tamamlandı</Text>
                              </View>
                            ) : null}
                          </View>
                          <Text style={styles.exerciseDetails}>
                            {exercise.sets} set x {exercise.reps} tekrar
                            {exercise.weight && exercise.weight > 0 && ` • ${exercise.weight} kg`}
                            {exercise.restTime && ` • ${exercise.restTime} sn dinlenme`}
                          </Text>
                          
                          {/* Egzersiz ekstra kontrolleri */}
                          <View style={styles.exerciseControls}>
                            <TouchableOpacity 
                              style={[styles.exerciseControlButton, { backgroundColor: theme.colors.gray200 }]}
                              onPress={() => {/* TODO: Egzersiz düzenleme */}}
                            >
                              <MaterialCommunityIcons name="pencil" size={16} color={theme.colors.text.secondary} />
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                              style={[styles.exerciseControlButton, { backgroundColor: exercise.completed ? theme.colors.success + '30' : theme.colors.primary + '30' }]}
                              onPress={() => {/* TODO: Egzersiz tamamlama */}}
                              disabled={exercise.completed}
                            >
                              <MaterialCommunityIcons 
                                name={exercise.completed ? "check-circle" : "check"} 
                                size={16} 
                                color={exercise.completed ? theme.colors.success : theme.colors.primary} 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {workout.notes && (
                    <View key={`${workout._id}-notes`} style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notlar:</Text>
                      <Text style={styles.notesText}>{workout.notes}</Text>
                    </View>
                  )}
                </React.Fragment>
              )}

              <View key={`workout-actions-${workout._id}`} style={styles.workoutActions}>
                <Button 
                  key={`${workout._id}-complete-btn`}
                  title={workout.completed ? "Tamamlandı" : "Tamamla"} 
                  onPress={() => completeWorkout(workout._id)}
                  style={workout.completed ? styles.completedButton : styles.actionButton}
                  disabled={workout.completed}
                />
                <Button 
                  key={`${workout._id}-edit-btn`}
                  title="Düzenle" 
                  onPress={() => {/* TODO: Antrenman düzenleme sayfasına yönlendir */}}
                  style={styles.editButton}
                />
              </View>
            </Card>
          </View>
        ))
      )}
      
      <TouchableOpacity key="floating-add-button" style={styles.floatingButton} onPress={() => {/* TODO: Antrenman ekleme sayfasına git */}}>
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
      </TouchableOpacity>
      
      {/* Sayfa altında boşluk */}
      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// Yeni renk fonksiyonu ekleyelim
const getWorkoutTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'kardiyo':
      return '#FF9800'; // warning rengi
    case 'kuvvet':
      return theme.colors.primary;
    case 'esneklik':
      return '#4CAF50'; // success rengi
    case 'hiit':
      return '#F44336'; // danger rengi
    case 'pilates':
      return '#2196F3'; // info rengi
    case 'yoga':
      return '#9C27B0'; // mor
    default:
      return theme.colors.primary;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: StyleGuide.layout.screenPadding,
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    color: 'white',
    fontSize: 16,
    opacity: 0.9,
  },
  nameText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  calendarButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statsScrollView: {
    marginBottom: 8,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 14,
    marginRight: 12,
    width: 160,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: 13,
    color: theme.colors.text.secondary,
  },
  filterSection: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: theme.colors.gray200,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterChipText: {
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  activeFilterChipText: {
    color: theme.colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.default,
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.danger + '30',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  cardShadow: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 12,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    width: 200,
    backgroundColor: theme.colors.primary,
  },
  workoutCard: {
    padding: StyleGuide.layout.padding,
    borderRadius: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  workoutInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  workoutType: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  difficultyText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    marginBottom: 16,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  workoutDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray200,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  detailText: {
    color: theme.colors.text.secondary,
    fontSize: 13,
    marginLeft: 6,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: 16,
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  exercisesHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  exercisesList: {
    marginTop: 8,
  },
  exerciseItem: {
    marginBottom: 12,
    padding: 14,
    backgroundColor: theme.colors.gray100,
    borderRadius: 10,
  },
  exerciseHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  completedText: {
    fontSize: 10,
    color: theme.colors.white,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  exerciseDetails: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 8,
  },
  exerciseControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  exerciseControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  notesContainer: {
    backgroundColor: '#FFFDF0',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.warning + '30',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  notesText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
  },
  workoutActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: theme.colors.primary,
  },
  completedButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: theme.colors.success + '70',
  },
  editButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: theme.colors.gray200,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
}); 