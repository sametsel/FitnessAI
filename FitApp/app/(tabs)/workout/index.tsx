import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, ViewStyle, RefreshControl, Animated, Platform, Alert, Modal, Pressable } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/theme/theme';
import { StyleGuide } from '../../../src/styles/StyleGuide';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../../src/services/api';
import { Workout } from '../../../src/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../../src/components/common/Header';
import { WorkoutFilter } from '../../../src/components/workout/WorkoutFilter';
import { WorkoutCard } from '../../../src/components/workout/WorkoutCard';
import { workoutService } from '../../../src/services/workout.service';
import { WorkoutList } from '../../../src/components/workout/WorkoutList';
import { Snackbar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Takvim için Türkçe ayarları
LocaleConfig.locales['tr'] = {
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık'
  ],
  monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  dayNamesShort: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
  today: 'Bugün'
};
LocaleConfig.defaultLocale = 'tr';

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
  const [allWorkouts, setAllWorkouts] = useState<ExtendedWorkout[]>([]);
  const [displayedWorkouts, setDisplayedWorkouts] = useState<ExtendedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<{[key: string]: boolean}>({});
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [greeting, setGreeting] = useState('');
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [markedDates, setMarkedDates] = useState<{[key: string]: any}>({});

  useEffect(() => {
    fetchWorkouts();
    setGreetingMessage();
  }, []);

  useEffect(() => {
    // Seçilen tarihe göre antrenmanları filtrele
    const filtered = allWorkouts.filter(workout => workout.date === selectedDate);
    setDisplayedWorkouts(filtered);
  }, [selectedDate, allWorkouts]);

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
      const userId = user?._id || user?.id || '';
      if (!userId) {
        setError('Kullanıcı bilgisi bulunamadı. Lütfen yeniden giriş yapın.');
        setLoading(false);
        return;
      }
      
      const fetchedPlans = await api.getWorkouts(userId);
      const workouts = Array.isArray(fetchedPlans)
        ? fetchedPlans.flatMap((plan: any) => Array.isArray(plan.workouts) ? plan.workouts : [])
        : [];

      // Tarihe göre sırala (en yeniden en eskiye)
      const sortedWorkouts = workouts
        .map((workout: any, idx: number) => ({
          ...workout,
          _id: workout.id || workout._id || idx,
          name: workout.type,
          difficulty: 'orta',
          createdAt: new Date(workout.createdAt || workout.date),
          updatedAt: new Date(workout.updatedAt || workout.date),
          exercises: Array.isArray(workout.exercises)
            ? workout.exercises.map((ex: any) => ({
                ...ex,
                completed: false
              }))
            : []
        } as ExtendedWorkout))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllWorkouts(sortedWorkouts);

      // Takvim için işaretli günleri hazırla
      const marked: {[key: string]: any} = {};
      sortedWorkouts.forEach(workout => {
        const dateStr = typeof workout.date === 'string' ? workout.date : new Date(workout.date).toISOString().split('T')[0];
        marked[dateStr] = {
          marked: true,
          dotColor: theme.colors.primary,
          selected: dateStr === selectedDate
        };
      });
      setMarkedDates(marked);

      setError(null);
    } catch (err) {
      setError('Antrenmanlar yüklenirken bir hata oluştu');
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
    if (!activeFilter) return allWorkouts;
    
    return allWorkouts.filter(workout => {
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

  // Motivasyon mesajları
  const motivationMessages = [
    'Harika iş çıkardın! Devam et!',
    'Süpersin! Her gün daha iyiye!',
    'Tebrikler, hedeflerine bir adım daha yaklaştın!',
    'Enerjin çok iyi, aynen devam!',
    'Vazgeçme, başarıya çok yakınsın!'
  ];
  const allDoneMessages = [
    'Tüm antrenmanlarını tamamladın! Müthişsin! 🎉',
    'Bugün harikaydın, tüm planı bitirdin! 🏆',
    'Süper! Bugünün tüm antrenmanları tamamlandı! 💪',
    'Efsanesin! Bugün kendini aştın! 🔥'
  ];

  // Antrenman tamamlama fonksiyonu (sadece state günceller)
  const handleCompleteWorkout = (workoutId: string) => {
   
    setAllWorkouts(prev => {
      const updated = prev.map(w =>
        w._id === workoutId || w.id === workoutId ? { ...w, completed: true } : w
      );
      const remaining = updated.filter(w => !w.completed);
      let msg = '';
      if (remaining.length === 0 && updated.length > 0) {
        msg = allDoneMessages[Math.floor(Math.random() * allDoneMessages.length)];
        
        setModalMessage(msg);
        setModalVisible(true);
      } else {
        msg = motivationMessages[Math.floor(Math.random() * motivationMessages.length)];
        
        setModalMessage(msg);
        setModalVisible(true);
      }
      // Otomatik kapansın
      setTimeout(() => setModalVisible(false), 2500);
      return updated;
    });
  };

  const fetchTodayWorkout = async () => {
    try {
      // Bu fonksiyon artık kullanılmıyor, kaldırılabilir
    } catch (err) {
      // Hata durumu
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

  // Key üretici fonksiyon
  const getWorkoutKey = (workout: any, idx: number) => {
    if (workout._id) return `workout-${workout._id}`;
    if (workout.id) return `workout-${workout.id}`;
    return `workout-${workout.date || 'no-date'}-${workout.name || 'no-name'}-${idx}`;
  };

  // Panel için istatistikler
  const totalPlanned = allWorkouts.length;
  const totalCompleted = allWorkouts.filter(w => w.completed).length;

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setIsCalendarVisible(false);
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Header 
        greeting={greeting}
      />

      <TouchableOpacity 
        style={styles.calendarButton}
        onPress={() => setIsCalendarVisible(!isCalendarVisible)}
      >
        <MaterialCommunityIcons name="calendar" size={24} color={theme.colors.primary} />
        <Text style={styles.calendarButtonText}>
          {new Date(selectedDate).toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </Text>
      </TouchableOpacity>

      {isCalendarVisible && (
        <Card style={styles.calendarCard}>
          <Calendar
            onDayPress={onDayPress}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.primary,
              monthTextColor: theme.colors.primary,
              indicatorColor: theme.colors.primary,
              textDayFontWeight: '300',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '300',
              textDayFontSize: 16,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 16
            }}
            firstDay={1}
          />
        </Card>
      )}

      <WorkoutList
        workouts={displayedWorkouts}
        onAddWorkout={() => {
          Alert.alert('Yeni Antrenman', 'Yeni antrenman ekleme ekranı açılacak.');
        }}
        onComplete={handleCompleteWorkout}
      />

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={() => {/* TODO: Antrenman ekleme sayfasına git */}}
      >
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primary + 'CC']}
          style={styles.floatingButtonGradient}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
      <View style={{ height: 80 }} />

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.centeredModal}>
            <Text style={styles.modalText}>{modalMessage}</Text>
          </View>
        </Pressable>
      </Modal>
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
    padding: 16,
  },
  headerGradient: {
    marginHorizontal: -16,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  calendarCard: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  filterSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 16,
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
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
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
  floatingButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  todayCardContent: {
    padding: 20,
  },
  todayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginLeft: 8,
  },
  todayName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: 12,
  },
  todayDetails: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  todayDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayDetailText: {
    marginLeft: 4,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  todayButton: {
    width: 140,
    alignSelf: 'center',
  },
  todayText: {
    fontSize: 15,
    color: theme.colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  statsPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: 16,
    marginBottom: 20,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statsItem: {
    alignItems: 'center',
  },
  statsLabel: {
    color: theme.colors.text.secondary,
    fontSize: 15,
    marginBottom: 4,
  },
  statsValue: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredModal: {
    backgroundColor: theme.colors.primary,
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    paddingVertical: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  selectedDateText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statsPanelModern: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: theme.colors.background.paper,
    borderRadius: 16,
    marginBottom: 20,
    paddingVertical: 18,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  statsItemModern: {
    alignItems: 'center',
    flex: 1,
  },
  statsLabelModern: {
    color: theme.colors.text.secondary,
    fontSize: 15,
    marginBottom: 2,
    fontWeight: '500',
  },
  statsValueModern: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 26,
    marginTop: 2,
  },
}); 