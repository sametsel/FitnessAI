import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Platform, Alert, Modal, Pressable } from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Card } from 'react-native-paper';
import { theme } from '../../../src/theme/theme';
import { StyleGuide } from '../../../src/styles/StyleGuide';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../../src/components/common/Header';
import { NutritionSummary } from '../../../src/components/nutrition/NutritionSummary';
import { MealList } from '../../../src/components/nutrition/MealList';
import { nutritionService } from '../../../src/services/nutrition.service';
import { api } from '../../../src/services/api';
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

const MEAL_ORDER = [
  { id: 'breakfast', name: 'Kahvaltı', icon: 'food-apple', color: '#FF9500', time: '07:00-09:00' },
  { id: 'snack1', name: 'Ara Öğün', icon: 'food-apple-outline', color: '#9C27B0', time: '10:00-11:00' },
  { id: 'lunch', name: 'Öğle Yemeği', icon: 'food', color: '#4CAF50', time: '12:00-14:00' },
  { id: 'snack2', name: 'Ara Öğün 2', icon: 'food-apple-outline', color: '#9C27B0', time: '15:00-16:00' },
  { id: 'dinner', name: 'Akşam Yemeği', icon: 'food-turkey', color: '#2196F3', time: '18:00-20:00' },
];

const MEAL_TYPE_MAP: Record<string, string> = {
  breakfast: 'sabah',
  snack1: 'ara_ogun',
  lunch: 'ogle',
  snack2: 'ara_ogun_2',
  dinner: 'aksam',
};

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState({
    calories: { consumed: 0, target: 2000 },
    protein: { consumed: 0, target: 120 },
    carbs: { consumed: 0, target: 220 },
    fat: { consumed: 0, target: 65 }
  });
  const [meals, setMeals] = useState<any[]>([]);
  const [nutritionDays, setNutritionDays] = useState<string[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [waterAmount, setWaterAmount] = useState(0); // ml cinsinden
  const waterTarget = 2500; // ml

  useEffect(() => {
    fetchNutritionDays();
  }, []);

  const fetchNutritionDays = async () => {
    try {
      const userId = user?._id || user?.id || '';
      if (!userId) return;

      // Sadece günleri ve plan var/yok bilgisini çek
      const days = await api.getNutritionDays(userId); // [{date, hasPlan, plan}]
      console.log('DAYS endpoint response:', days);

      // Sadece planı olan günleri işaretle
      const marked: any = {};
      days.forEach((day: any) => {
        if (day.hasPlan && day.plan) {
          const dateStr = new Date(day.date).toISOString().split('T')[0];
          const mealCount = Array.isArray(day.plan.meals) ? day.plan.meals.length : 0;
          marked[dateStr] = {
            marked: true,
            dotColor: mealCount >= 3 ? '#4CAF50' : '#2196F3',
            selected: dateStr === selectedDate,
            selectedColor: theme.colors.primary,
            customStyles: {
              container: {
                backgroundColor: mealCount >= 3 ? '#E8F5E9' : '#E3F2FD',
                borderRadius: 8,
                borderWidth: 1,
                borderColor: mealCount >= 3 ? '#4CAF50' : '#2196F3'
              },
              text: {
                color: mealCount >= 3 ? '#2E7D32' : '#1565C0',
                fontWeight: 'bold'
              }
            }
          };
        }
      });
      // Bugünün tarihi ayrıca işaretlensin
      const today = new Date().toISOString().split('T')[0];
      if (!marked[today]) {
        marked[today] = {
          selected: today === selectedDate,
          selectedColor: theme.colors.primary
        };
      }
      console.log('markedDates:', marked);
      setMarkedDates(marked);
      setNutritionDays(days.filter((d: any) => d.hasPlan).map((d: any) => new Date(d.date).toISOString().split('T')[0]));
    } catch (err) {
      setNutritionDays([]);
      setMarkedDates({});
      console.error('Beslenme günleri yüklenirken hata:', err);
    }
  };

  const onDayPress = (day: any) => {
    const selected = new Date(day.dateString).toISOString().split('T')[0];
    setSelectedDate(selected);
    setIsCalendarVisible(false);
    // Takvim işaretlemelerini güncelle
    setMarkedDates((prev: any) => {
      const newMarks = { ...prev };
      Object.keys(newMarks).forEach(key => {
        newMarks[key] = {
          ...newMarks[key],
          selected: key === selected
        };
      });
      return newMarks;
    });
  };

  // Seçili güne göre beslenme verisini çek
  useEffect(() => {
    fetchNutritionForSelectedDate();
  }, [selectedDate]);

  const fetchNutritionForSelectedDate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userId = user?._id || user?.id || '';
      if (!userId) throw new Error('Kullanıcı bulunamadı');
      // Yeni endpoint ile çek
      const data = await api.getDailyNutritionPlan(selectedDate, userId);
      console.log('PLAN endpoint response:', data);
      const plan = data.data || data;
      setMeals(plan.meals || []);
      setDailySummary({
        calories: { consumed: plan.totalCalories || 0, target: 2000 },
        protein: { consumed: plan.totalProtein || 0, target: 120 },
        carbs: { consumed: plan.totalCarbs || 0, target: 220 },
        fat: { consumed: plan.totalFat || 0, target: 65 },
      });
      console.log('STATE meals:', plan.meals || []);
      console.log('STATE dailySummary:', {
        calories: { consumed: plan.totalCalories || 0, target: 2000 },
        protein: { consumed: plan.totalProtein || 0, target: 120 },
        carbs: { consumed: plan.totalCarbs || 0, target: 220 },
        fat: { consumed: plan.totalFat || 0, target: 65 },
      });
    } catch (err) {
      setMeals([]);
      setDailySummary({
        calories: { consumed: 0, target: 2000 },
        protein: { consumed: 0, target: 120 },
        carbs: { consumed: 0, target: 220 },
        fat: { consumed: 0, target: 65 },
      });
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('PLAN endpoint error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchNutritionForSelectedDate();
    setRefreshing(false);
  }, [selectedDate]);

  const handleAddWater = (amount: number) => {
    setWaterAmount(prev => Math.min(prev + amount, waterTarget));
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Beslenme verileriniz yükleniyor...</Text>
      </View>
    );
  }

  console.log('MealList props:', meals);
  console.log('Calendar markedDates prop:', markedDates);

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <Header
        greeting={`Beslenme Planı`}
        showCalendar={false}
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
            markingType="custom"
          />
        </Card>
      )}

      <NutritionSummary dailySummary={dailySummary} />
      <MealList meals={meals} onAddFood={() => {}} />
      
      {/* Su Takibi */}
      <Card style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterHeaderLeft}>
            <MaterialCommunityIcons name="cup-water" size={24} color={theme.colors.primary} />
            <Text style={styles.waterTitle}>Su Takibi</Text>
          </View>
          <Text style={styles.waterAmount}>{(waterAmount / 1000).toFixed(1)} / {(waterTarget / 1000).toFixed(1)} L</Text>
        </View>
        <View style={styles.waterProgressContainer}>
          <View style={styles.waterProgress}>
            <View style={[styles.waterProgressBar, { width: `${Math.min((waterAmount / waterTarget) * 100, 100)}%` }]} />
          </View>
        </View>
        <View style={styles.waterButtonsContainer}>
          {[100, 250, 500].map((amount) => (
            <TouchableOpacity 
              key={amount} 
              style={styles.waterButton}
              onPress={() => handleAddWater(amount)}
            >
              <Text style={styles.waterButtonText}>+{amount} ml</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>
      
      {/* Yeni Öğün veya Besin Ekleme Butonu */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={() => {/* TODO: Besin veya öğün ekleme sayfası */}}
      >
        <MaterialCommunityIcons name="plus" size={24} color={theme.colors.white} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
    padding: StyleGuide.layout.screenPadding,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  waterCard: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.background.paper,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  waterHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  waterAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  waterProgressContainer: {
    marginBottom: 16,
  },
  waterProgress: {
    height: 12,
    backgroundColor: theme.colors.gray100,
    borderRadius: 6,
  },
  waterProgressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  waterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  waterButton: {
    backgroundColor: theme.colors.gray100,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  waterButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
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
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
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
}); 