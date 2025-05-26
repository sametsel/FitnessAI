import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, Platform, Image, Dimensions, TouchableOpacity } from 'react-native';
import { Card, Title, Paragraph, Text, Button, Avatar, ProgressBar, Chip, Surface, useTheme } from 'react-native-paper';
import { useAuth } from '../../src/context/AuthContext';
import { API_URL } from '../../src/config';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { QuickStats } from '../../src/components/home/QuickStats';
import { TodayWorkout } from '../../src/components/home/TodayWorkout';
import { NutritionSummary } from '../../src/components/home/NutritionSummary';
import { api } from '../../src/services/api';
import { nutritionService } from '../../src/services/nutrition.service';
import userService from '../../src/services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [todayWorkouts, setTodayWorkouts] = useState<any[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [nutritionLoading, setNutritionLoading] = useState(true);
  const [nutritionError, setNutritionError] = useState<string | null>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [totalCarbs, setTotalCarbs] = useState(0);
  const [totalFat, setTotalFat] = useState(0);
  const theme = useTheme();

  // Günün saatine göre selamlama mesajı
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const handleStartWorkout = () => {
    // Antrenman başlatma işlemi
    console.log('Antrenman başlatılıyor...');
  };

  const handleAddMeal = () => {
    // Öğün ekleme işlemi
    alert('Öğün ekleme fonksiyonu!');
  };

  useEffect(() => {
    fetchTodayWorkouts();
    fetchTodayNutrition();
  }, []);

  const fetchTodayWorkouts = async () => {
    try {
      setTodayLoading(true);
      const userId = user?._id || user?.id || '';
      if (!userId) return;
      const fetchedPlans = await api.getWorkouts(userId);
      const workouts = Array.isArray(fetchedPlans)
        ? fetchedPlans.flatMap((plan: any) => Array.isArray(plan.workouts) ? plan.workouts : [])
        : [];
      const today = new Date().toISOString().split('T')[0];
      const filteredWorkouts = workouts.filter((w: any) => w.date === today);
      setTodayWorkouts(filteredWorkouts);
    } catch (err) {
      setTodayWorkouts([]);
    } finally {
      setTodayLoading(false);
    }
  };

  const fetchTodayNutrition = async () => {
    try {
      setNutritionLoading(true);
      setNutritionError(null);
      const data = await nutritionService.getTodayNutrition();
      setMeals(data.meals || []);
      setTotalCalories(data.totalCalories || 0);
      setTotalProtein(data.totalProtein || 0);
      setTotalCarbs(data.totalCarbs || 0);
      setTotalFat(data.totalFat || 0);
    } catch (err) {
      setMeals([]);
      setTotalCalories(0);
      setTotalProtein(0);
      setTotalCarbs(0);
      setTotalFat(0);
      setNutritionError('Beslenme verisi yüklenemedi.');
    } finally {
      setNutritionLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>{getGreetingMessage()},</Text>
          <Text style={styles.userName}>{user?.name || 'Kullanıcı'}</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Avatar.Text 
            size={40} 
            label={user?.name?.substring(0, 2).toUpperCase() || 'U'} 
          />
        </TouchableOpacity>
      </View>

      <QuickStats 
        workoutCount={todayWorkouts.length}
        caloriesBurned={0}
        totalCalories={0}
      />

      {todayWorkouts.length > 0 ? (
        <TodayWorkout
          type="Bugünkü Antrenmanlar"
          completed={todayWorkouts.every(w => w.completed)}
          exercises={todayWorkouts}
          onStartWorkout={handleStartWorkout}
        />
      ) : (
        <TodayWorkout
          type="Dinlenme Günü"
          completed={false}
          exercises={[]}
          onStartWorkout={handleStartWorkout}
        />
      )}

      <Card style={styles.nutritionCard}>
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
          {nutritionLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
              <Text style={{ marginTop: 8 }}>Beslenme verisi yükleniyor...</Text>
            </View>
          ) : nutritionError ? (
            <Text style={{ color: 'red', padding: 10 }}>{nutritionError}</Text>
          ) : (
            <NutritionSummary 
              totalCalories={totalCalories}
              totalProtein={totalProtein}
              totalCarbs={totalCarbs}
              totalFat={totalFat}
              meals={meals}
            />
          )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  profileButton: {
    marginLeft: 10,
  },
  nutritionCard: {
    margin: 15,
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
  mealsSection: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  }
}); 