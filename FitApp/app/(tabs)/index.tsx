import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Avatar, ProgressBar, Chip, Surface, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/config';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// API URL artık ana domain, endpoint'i ayrıca eklememiz gerekiyor
const DAILY_SUMMARY_ENDPOINT = `${API_URL}/daily-summary`;
const { width } = Dimensions.get('window');

console.log('ENDPOINT URL:', DAILY_SUMMARY_ENDPOINT);

export default function HomeScreen() {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const theme = useTheme();

  const loadData = async () => {
    if (!token) {
      console.log('TOKEN YOK - Oturum bulunamadı');
      setError('Kullanıcı oturumu bulunamadı. Lütfen tekrar giriş yapın.');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Endpoint ve token bilgisini kontrol et
      console.log('--- API İSTEĞİ BAŞLIYOR ---');
      console.log('Endpoint:', DAILY_SUMMARY_ENDPOINT);
      console.log('Token (ilk 15):', token.substring(0, 15) + '...');
      console.log('Platform:', Platform.OS);
      
      // Ağ bağlantısı kontrolü
      try {
        const networkTestResponse = await fetch('https://www.google.com');
        console.log('İnternet bağlantısı testi:', networkTestResponse.status);
      } catch (netErr) {
        console.error('İnternet bağlantısı testi hatası:', netErr);
      }
      
      // Gerçek API isteği
      const response = await fetch(DAILY_SUMMARY_ENDPOINT, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);
      console.log('Response headers:', JSON.stringify(response.headers));
      
      const responseText = await response.text();
      console.log('Raw response text:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error('JSON parse hatası:', jsonError);
        throw new Error(`Geçersiz JSON yanıtı: ${responseText.substring(0, 100)}...`);
      }
      
      console.log('Response data:', JSON.stringify(data).substring(0, 100) + '...');
      
      if (data.success) {
        setSummary(data.data);
        
        // Takvim için işaretlenmiş günleri ayarla
        const today = new Date().toISOString().split('T')[0];
        const nextWorkoutDate = new Date(data.data.nextWorkout.scheduledDate).toISOString().split('T')[0];
        
        // Örnek: Bugünü ve sonraki antrenman gününü işaretle
        const marked = {
          [today]: {
            selected: true,
            selectedColor: theme.colors.primary,
            marked: true,
            dotColor: '#FF9500',
          }
        };
        
        // Sonraki antrenman günü
        if (nextWorkoutDate) {
          marked[nextWorkoutDate] = {
            marked: true,
            dotColor: '#FF3B30',
            selected: false,
            selectedColor: theme.colors.primary
          };
        }
        
        setMarkedDates(marked);
        console.log('Veri başarıyla yüklendi');
      } else {
        setError(`Veri alınamadı: ${data.message || 'Bilinmeyen hata'}`);
        console.error('API yanıt hatası:', data);
      }
    } catch (err: any) {
      console.error('API isteği hatası:', err);
      console.error('Hata mesajı:', err.message);
      console.error('Hata stack:', err.stack);
      setError(`Sunucuya bağlanılamadı: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setLoading(false);
      console.log('--- API İSTEĞİ TAMAMLANDI ---');
    }
  };

  useEffect(() => {
    console.log('HomeScreen mount oldu, token var mı?', !!token);
    if (token) {
      loadData();
    }
  }, [token]);

  // Otomatik yeniden deneme
  useEffect(() => {
    if (error && retryCount < 3) {
      console.log(`Hata nedeniyle ${retryCount + 1}. kez yeniden deneniyor...`);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        loadData();
      }, 3000); // 3 saniye sonra yeniden dene
      
      return () => clearTimeout(timer);
    }
  }, [error, retryCount]);

  const handleDateSelect = (date: DateData) => {
    setSelectedDate(date.dateString);
    
    // Bugün için markeları güncelle
    setMarkedDates({
      ...markedDates,
      [date.dateString]: {
        selected: true,
        selectedColor: theme.colors.primary,
      }
    });
  };

  // Günün saatine göre selamlama mesajı
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  // Makro besin dağılımı için yüzdeleri hesapla
  const calculateMacroPercentages = () => {
    if (!summary) return { protein: 0, carbs: 0, fat: 0 };
    
    const { totalProtein, totalCarbs, totalFat } = summary.todayNutrition;
    const totalGrams = totalProtein + totalCarbs + totalFat;
    
    if (totalGrams === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    return {
      protein: Math.round((totalProtein / totalGrams) * 100),
      carbs: Math.round((totalCarbs / totalGrams) * 100),
      fat: Math.round((totalFat / totalGrams) * 100)
    };
  };

  // Plan oluşturma fonksiyonu
  const handleCreatePlan = async () => {
    try {
      setLoading(true);
      setError(null);
      // Kullanıcı verilerini hazırla
      const userData = {
        name: user?.name,
        gender: user?.gender,
        age: user?.age,
        weight: user?.weight,
        height: user?.height,
        activity_level: user?.activityLevel,
        goal: user?.goal,
        dietary_restrictions: 0,
        allergies: 0,
        preferred_cuisine: 1,
        meal_preferences: 4,
        calorie_target: 2000
      };
      // Beslenme planı isteği
      const nutritionRes = await fetch(`${API_URL}/nutrition/ai-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const nutritionPlan = await nutritionRes.json();
      // Antrenman planı isteği
      const workoutRes = await fetch(`${API_URL}/workouts/ai-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const workoutPlan = await workoutRes.json();
      setLoading(false);
      // Sonuçları göster (ileride ilgili sayfalara yönlendirme yapılabilir)
      Alert.alert('Planlar Oluşturuldu', 'Beslenme ve antrenman planı başarıyla alındı!');
      // Burada planları context veya navigation ile ilgili sayfalara aktarabilirsin
      // Örn: navigation.navigate('nutrition', { plan: nutritionPlan })
    } catch (err) {
      setLoading(false);
      setError('Plan oluşturulurken hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={loadData} 
          style={styles.retryButton}
          icon="refresh"
        >
          Tekrar Dene
        </Button>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.emptyContainer}>
        <FontAwesome5 name="clipboard-list" size={50} color="#888" />
        <Text style={styles.emptyText}>Henüz veri yok. Lütfen antrenman veya beslenme ekleyin.</Text>
        <Button mode="contained" onPress={loadData} style={{marginTop: 20}}>Yenile</Button>
      </View>
    );
  }

  const macroPercentages = calculateMacroPercentages();

  return (
    <ScrollView style={styles.container}>
      {/* Plan Oluştur Butonu */}
      <Button
        mode="contained"
        icon="plus"
        style={{ margin: 16, backgroundColor: theme.colors.primary }}
        labelStyle={{ color: '#fff', fontWeight: 'bold' }}
        onPress={handleCreatePlan}
      >
        Plan Oluştur
      </Button>
      {/* Selamlama Kartı */}
      <LinearGradient
        colors={['#00adf5', '#0088cc']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>{getGreetingMessage()},</Text>
            <Text style={styles.nameText}>{user?.name || 'Kullanıcı'}</Text>
          </View>
          <Avatar.Image 
            source={{uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')}} 
            size={60} 
          />
        </View>
      </LinearGradient>

      {/* Hızlı Özet Kartları */}
      <View style={styles.quickStatsContainer}>
        <Surface style={[styles.quickStatCard, { backgroundColor: '#4CAF50' }]}>
          <View style={styles.quickStatContent}>
            <FontAwesome5 name="dumbbell" size={20} color="white" />
            <Text style={styles.quickStatValue}>{summary.workoutStats.completedWorkouts}</Text>
            <Text style={styles.quickStatLabel}>Antrenman</Text>
          </View>
        </Surface>
        
        <Surface style={[styles.quickStatCard, { backgroundColor: '#FF9800' }]}>
          <View style={styles.quickStatContent}>
            <FontAwesome5 name="fire" size={20} color="white" />
            <Text style={styles.quickStatValue}>{summary.workoutStats.caloriesBurned || 0}</Text>
            <Text style={styles.quickStatLabel}>Yakılan</Text>
          </View>
        </Surface>
        
        <Surface style={[styles.quickStatCard, { backgroundColor: '#2196F3' }]}>
          <View style={styles.quickStatContent}>
            <FontAwesome5 name="apple-alt" size={20} color="white" />
            <Text style={styles.quickStatValue}>{summary.todayNutrition.totalCalories}</Text>
            <Text style={styles.quickStatLabel}>Kalori</Text>
          </View>
        </Surface>
      </View>

      {/* Takvim Kartı */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons name="calendar-month" size={22} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>Antrenman Takviminiz</Title>
          </View>
          <Calendar
            onDayPress={handleDateSelect}
            markedDates={markedDates}
            enableSwipeMonths
            hideExtraDays
            theme={{
              todayTextColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              dotStyle: { marginTop: 1 }
            }}
          />
        </Card.Content>
      </Card>
      
      {/* Bugünkü Antrenman Kartı */}
      <Card style={styles.card}>
        <LinearGradient
          colors={['#38A169', '#48BB78']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.cardHeaderGradient}
        >
          <View style={styles.cardHeaderContent}>
            <FontAwesome5 name="dumbbell" size={20} color="white" />
            <Text style={styles.cardHeaderTitle}>Bugünkü Antrenman</Text>
          </View>
        </LinearGradient>
        <Card.Content style={styles.workoutCardContent}>
          <View style={styles.workoutDetails}>
            <Text style={styles.workoutType}>{summary.todayWorkout.type || 'Dinlenme Günü'}</Text>
            <Chip 
              icon={summary.todayWorkout.completed ? "check" : "clock"}
              style={{
                backgroundColor: summary.todayWorkout.completed ? '#4CAF5033' : '#FF980033'
              }}
            >
              {summary.todayWorkout.completed ? 'Tamamlandı' : 'Planlandı'}
            </Chip>
          </View>
          
          {summary.todayWorkout.exercises && summary.todayWorkout.exercises.length > 0 ? (
            <View style={styles.exercisesContainer}>
              {summary.todayWorkout.exercises.slice(0, 3).map((exercise: any, idx: number) => (
                <View key={idx} style={styles.exerciseItem}>
                  <MaterialCommunityIcons 
                    name={exercise.type === 'cardio' ? 'run' : 'arm-flex'} 
                    size={18} 
                    color={theme.colors.primary}
                  />
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.type === 'cardio' 
                      ? `${exercise.duration} dk` 
                      : `${exercise.sets} set × ${exercise.reps} tekrar`}
                  </Text>
                </View>
              ))}
              
              {summary.todayWorkout.exercises.length > 3 && (
                <Text style={styles.moreExercises}>+{summary.todayWorkout.exercises.length - 3} egzersiz daha</Text>
              )}
            </View>
          ) : (
            <Text style={styles.noWorkoutMessage}>
              {summary.todayWorkout.type ? 'Henüz egzersiz eklenmemiş' : 'Bugün için planlanmış antrenman yok'}
            </Text>
          )}
          
          <Button 
            mode="contained" 
            onPress={() => {/* Antrenman sayfasına git */}} 
            style={styles.actionButton}
            icon="arrow-right"
          >
            {summary.todayWorkout.completed ? 'Detayları Gör' : 'Antrenmanı Başlat'}
          </Button>
        </Card.Content>
      </Card>

      {/* Sonraki Antrenman Kartı */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons name="calendar-clock" size={22} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>Sonraki Antrenman</Title>
          </View>
          <View style={styles.nextWorkoutContent}>
            <Surface style={styles.nextWorkoutIconContainer}>
              <FontAwesome5 
                name={summary.nextWorkout.type.toLowerCase().includes('kardiyo') ? 'running' : 'dumbbell'} 
                size={24} 
                color={theme.colors.primary} 
              />
            </Surface>
            <View style={styles.nextWorkoutDetails}>
              <Text style={styles.nextWorkoutType}>{summary.nextWorkout.type}</Text>
              <Text style={styles.nextWorkoutDate}>
                {new Date(summary.nextWorkout.scheduledDate).toLocaleDateString('tr-TR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Beslenme Özeti Kartı */}
      <Card style={styles.card}>
        <LinearGradient
          colors={['#2196F3', '#03A9F4']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          style={styles.cardHeaderGradient}
        >
          <View style={styles.cardHeaderContent}>
            <FontAwesome5 name="utensils" size={20} color="white" />
            <Text style={styles.cardHeaderTitle}>Günlük Beslenme</Text>
          </View>
        </LinearGradient>
        <Card.Content>
          <View style={styles.calorieContainer}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieValue}>{summary.todayNutrition.totalCalories}</Text>
              <Text style={styles.calorieLabel}>kcal</Text>
            </View>
            
            <View style={styles.macrosContainer}>
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroValue}>{summary.todayNutrition.totalProtein}g</Text>
                <Text style={styles.macroPercent}>{macroPercentages.protein}%</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar progress={macroPercentages.protein/100} color="#FF9800" style={styles.progressBar} />
                </View>
              </View>
              
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Karbonhidrat</Text>
                <Text style={styles.macroValue}>{summary.todayNutrition.totalCarbs}g</Text>
                <Text style={styles.macroPercent}>{macroPercentages.carbs}%</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar progress={macroPercentages.carbs/100} color="#4CAF50" style={styles.progressBar} />
                </View>
              </View>
              
              <View style={styles.macroItem}>
                <Text style={styles.macroLabel}>Yağ</Text>
                <Text style={styles.macroValue}>{summary.todayNutrition.totalFat}g</Text>
                <Text style={styles.macroPercent}>{macroPercentages.fat}%</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar progress={macroPercentages.fat/100} color="#F44336" style={styles.progressBar} />
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.mealsContainer}>
            <Text style={styles.sectionTitle}>Öğünler</Text>
            {summary.todayNutrition.meals.length > 0 ? (
              summary.todayNutrition.meals.map((meal: any, idx: number) => (
                <Surface key={idx} style={styles.mealItem}>
                  <View style={styles.mealHeader}>
                    <Text style={styles.mealName}>{meal.name}</Text>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                  </View>
                  <View style={styles.mealMacros}>
                    <Chip icon="fire" style={styles.mealChip}>{meal.calories} kcal</Chip>
                    <View style={styles.mealMacroValues}>
                      <Text style={styles.mealMacroText}>P: {meal.protein}g</Text>
                      <Text style={styles.mealMacroText}>K: {meal.carbs}g</Text>
                      <Text style={styles.mealMacroText}>Y: {meal.fat}g</Text>
                    </View>
                  </View>
                </Surface>
              ))
            ) : (
              <Text style={styles.emptyMealsText}>Henüz öğün kaydı yok</Text>
            )}
            
            <Button 
              mode="outlined" 
              onPress={() => {/* Beslenme sayfasına git */}} 
              style={styles.outlineButton}
              icon="plus"
            >
              Öğün Ekle
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 16,
    maxWidth: '80%',
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
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  quickStatCard: {
    width: (width - 40) / 3,
    borderRadius: 12,
    height: 90,
    elevation: 3,
  },
  quickStatContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickStatValue: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  quickStatLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  card: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
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
  workoutType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exercisesContainer: {
    marginTop: 10,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
  },
  exerciseDetails: {
    fontSize: 14,
    color: '#666',
  },
  moreExercises: {
    marginTop: 8,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  noWorkoutMessage: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  actionButton: {
    marginTop: 15,
    borderRadius: 8,
  },
  nextWorkoutContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextWorkoutIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 15,
  },
  nextWorkoutDetails: {
    flex: 1,
  },
  nextWorkoutType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  nextWorkoutDate: {
    marginTop: 4,
    color: '#666',
  },
  calorieContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  calorieCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
  },
  macrosContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  macroItem: {
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  macroPercent: {
    position: 'absolute',
    right: 0,
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 15,
  },
  mealsContainer: {
    marginTop: 10,
  },
  mealItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTime: {
    fontSize: 14,
    color: '#666',
  },
  mealMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  mealChip: {
    height: 30,
  },
  mealMacroValues: {
    flexDirection: 'row',
  },
  mealMacroText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 10,
  },
  emptyMealsText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  outlineButton: {
    marginTop: 10,
    borderRadius: 8,
  },
}); 