import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Image,
  FlatList,
  Alert,
  Platform,
  Pressable,
  useWindowDimensions
} from 'react-native';
import { useAuth } from '../../../src/context/AuthContext';
import { Card, Surface } from 'react-native-paper';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/theme/theme';
import { StyleGuide } from '../../../src/styles/StyleGuide';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../../src/services/api';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import userService, { UserProfile } from '../../../src/services/user.service';
import CircularProgress from '../../../components/CircularProgress';

// Besin tipi
interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  mealType: string;
  image: string;
}

// Tüm öğün tipleri için veri yapısını tiplendir
interface MealType {
  id: string;
  name: string;
  icon: 'food-apple' | 'food' | 'food-turkey' | 'food-apple-outline';
  time: string;
  color: string;
  foods: FoodItem[];
}

const MEAL_TYPES: MealType[] = [
  { id: 'breakfast', name: 'Kahvaltı', icon: 'food-apple', time: '07:00 - 09:00', color: '#FF9500', foods: [] },
  { id: 'lunch', name: 'Öğle Yemeği', icon: 'food', time: '12:00 - 14:00', color: '#4CAF50', foods: [] },
  { id: 'dinner', name: 'Akşam Yemeği', icon: 'food-turkey', time: '18:00 - 20:00', color: '#2196F3', foods: [] },
  { id: 'snack', name: 'Atıştırmalık', icon: 'food-apple-outline', time: 'Gün içinde', color: '#9C27B0', foods: [] },
];

// Öğün tipini tanımlayan arayüz
interface Meal {
  id: string;
  name: string;
  icon: string;
  time: string;
  color: string;
  foods: FoodItem[];
}

// Günün saatine göre selamlama mesajı
const greeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Günaydın';
  if (hours < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

export default function NutritionScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { user, token } = useAuth();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null);
  const [dailySummary, setDailySummary] = useState({
    calories: { consumed: 0, target: 2000 },
    protein: { consumed: 0, target: 120 },
    carbs: { consumed: 0, target: 220 },
    fat: { consumed: 0, target: 65 }
  });
  
  // Günlük toplam kalori ve makro hesaplama
  const dailyTotals = useMemo(() => {
    const totals = {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    
    // Tüm öğünlerdeki besinleri topla
    MEAL_TYPES.forEach(meal => {
      meal.foods.forEach(food => {
        totals.calories += food.calories;
        totals.protein += food.protein;
        totals.carbs += food.carbs;
        totals.fat += food.fat;
      });
    });
    
    return totals;
  }, [MEAL_TYPES]);
  
  // Hedef değerler - gerçek uygulamada kullanıcı verilerinden alınacak
  const targets = {
    calories: 2000,
    protein: 120,
    carbs: 240,
    fat: 65,
  };
  
  // Makroların toplam kalori içindeki yüzdeleri
  const macroPercentages = {
    protein: Math.round((dailyTotals.protein * 4 / dailyTotals.calories) * 100) || 0,
    carbs: Math.round((dailyTotals.carbs * 4 / dailyTotals.calories) * 100) || 0,
    fat: Math.round((dailyTotals.fat * 9 / dailyTotals.calories) * 100) || 0,
  };

  // Örnek verilerle sayfa başlat
  useEffect(() => {
    fetchUserData();
  }, [selectedDate]);

  // Kullanıcı verilerini çek
  useEffect(() => {
    fetchUserData();
  }, [user?.id]);

  const fetchUserData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      // Token'ı userService'e ekliyoruz
      if (token) {
        userService.setAuthToken(token);
      }
      const data = await userService.getProfile();
      setUserData(data);
      
      // Doğru formatta günlük özet oluştur
      const calculatedTotals = {
        calories: { 
          consumed: dailyTotals.calories || 0, 
          target: targets.calories 
        },
        protein: { 
          consumed: dailyTotals.protein || 0, 
          target: targets.protein 
        },
        carbs: { 
          consumed: dailyTotals.carbs || 0, 
          target: targets.carbs 
        },
        fat: { 
          consumed: dailyTotals.fat || 0, 
          target: targets.fat 
        }
      };
      
      setDailySummary(calculatedTotals);
      setError(null);
    } catch (err) {
      console.error('Kullanıcı verileri çekilemedi:', err);
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNutritionData = async () => {
    try {
      setIsLoading(true);
      if (!user?.id) {
        console.error('Kullanıcı kimliği bulunamadı');
        setError('Kullanıcı bilgileri alınamadı');
        setIsLoading(false);
        return;
      }
      
      // API'den gerçek veriler çekilecek (ileriki aşamalarda)
      // const nutritionData = await api.getNutrition(user.id, selectedDate);
      
      // Şimdilik mock veri kullanıyoruz
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsLoading(false);
    } catch (error) {
      console.error('Beslenme verileri yüklenirken hata:', error);
      setError('Beslenme verileri yüklenemedi');
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, [selectedDate]);

  const navigateDate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setSelectedDate(addDays(selectedDate, 1));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <Surface style={styles.foodItem}>
      <View style={styles.foodImageContainer}>
        <Image source={{ uri: item.image }} style={{width: 24, height: 24}} />
      </View>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPortion}>{item.portion}</Text>
      </View>
      <View style={styles.foodMacros}>
        <Text style={styles.caloriesText}>{item.calories} kcal</Text>
        <View style={styles.macroRow}>
          <Text style={styles.macroText}>P: {item.protein}g</Text>
          <Text style={styles.macroText}>K: {item.carbs}g</Text>
          <Text style={styles.macroText}>Y: {item.fat}g</Text>
        </View>
      </View>
    </Surface>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Beslenme verileriniz yükleniyor...</Text>
      </View>
    );
  }

  // Tarih formatlama 
  const getFormattedDate = () => {
    // Locale parametresi olmadan kullanıp daha sonra locale eklemeyi deneyelim
    const formatted = format(selectedDate, "d MMMM yyyy, EEEE");
    return formatted;
  };

  return (
    <ScrollView 
      style={[styles.container, { paddingTop: insets.top }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.headerGradient, { paddingTop: insets.top > 0 ? 0 : 20 }]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greetingText}>{greeting()}</Text>
            <Text style={styles.nameText}>{userData?.name || (user?.name || 'Değerli Üyemiz')}</Text>
          </View>
          <View style={styles.dateDisplay}>
            <TouchableOpacity onPress={() => navigateDate('prev')}>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.dateText}>{getFormattedDate()}</Text>
            <TouchableOpacity 
              onPress={() => navigateDate('next')}
              disabled={selectedDate >= new Date()}
            >
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={selectedDate >= new Date() ? 'rgba(255,255,255,0.5)' : '#fff'} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Makro ve Kalori Özeti */}
      <Card style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>Günlük Özet</Text>
        
        <View style={styles.calorieContainer}>
          <View style={styles.calorieTextContainer}>
            <Text style={styles.calorieValue}>{dailySummary.calories.consumed}</Text>
            <Text style={styles.calorieLabel}>Alınan Kalori</Text>
          </View>
          
          <View style={styles.calorieProgressContainer}>
            <View style={styles.calorieProgress}>
              <View 
                style={[
                  styles.calorieProgressBar, 
                  { width: `${Math.min(100, (dailySummary.calories.consumed / dailySummary.calories.target) * 100)}%` }
                ]} 
              />
            </View>
            <Text style={styles.calorieTarget}>Hedef: {dailySummary.calories.target} kcal</Text>
          </View>
        </View>
        
        <View style={styles.macrosContainer}>
          <View style={styles.macroItem}>
            <View style={[styles.macroCircle, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.macroPercent}>
                {Math.round((dailySummary.protein.consumed / dailySummary.calories.consumed * 4) * 100) / 100 * 100}%
              </Text>
            </View>
            <Text style={styles.macroItemValue}>{dailySummary.protein.consumed}g</Text>
            <Text style={styles.macroItemLabel}>Protein</Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroCircle, { backgroundColor: theme.colors.warning }]}>
              <Text style={styles.macroPercent}>
                {Math.round((dailySummary.carbs.consumed / dailySummary.calories.consumed * 4) * 100) / 100 * 100}%
              </Text>
            </View>
            <Text style={styles.macroItemValue}>{dailySummary.carbs.consumed}g</Text>
            <Text style={styles.macroItemLabel}>Karbonhidrat</Text>
          </View>
          
          <View style={styles.macroItem}>
            <View style={[styles.macroCircle, { backgroundColor: theme.colors.danger }]}>
              <Text style={styles.macroPercent}>
                {Math.round((dailySummary.fat.consumed / dailySummary.calories.consumed * 9) * 100) / 100 * 100}%
              </Text>
            </View>
            <Text style={styles.macroItemValue}>{dailySummary.fat.consumed}g</Text>
            <Text style={styles.macroItemLabel}>Yağ</Text>
          </View>
        </View>
      </Card>

      {/* Öğünler */}
      <View style={styles.mealsSection}>
        <Text style={styles.sectionTitle}>Bugünün Öğünleri</Text>
        
        {Object.values(MEAL_TYPES).map((meal) => (
          <Card key={meal.id} style={styles.mealCard}>
            <TouchableOpacity 
              style={styles.mealHeader} 
              onPress={() => setSelectedMeal(selectedMeal === meal.id ? null : meal.id)}
            >
              <View style={styles.mealHeaderLeft}>
                <View style={[styles.mealIconContainer, { backgroundColor: `${meal.color}20` }]}>
                  <MaterialCommunityIcons name={meal.icon as any} size={24} color={meal.color} />
                </View>
                <View>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
              </View>
              
              <View style={styles.mealHeaderRight}>
                <View style={styles.mealCaloriesWrapper}>
                  <Text style={styles.mealCalories}>
                    {meal.foods.reduce((total: number, food) => total + food.calories, 0)} kcal
                  </Text>
                  <Text style={styles.mealItemCount}>{meal.foods.length} besin</Text>
                </View>
                <MaterialCommunityIcons 
                  name={selectedMeal === meal.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color={theme.colors.text.secondary} 
                />
              </View>
            </TouchableOpacity>
            
            {selectedMeal === meal.id && (
              <View style={styles.mealContent}>
                {meal.foods.length > 0 ? (
                  <FlatList
                    data={meal.foods}
                    renderItem={renderFoodItem}
                    keyExtractor={item => item.id.toString()}
                    scrollEnabled={false}
                    ItemSeparatorComponent={() => <View style={styles.foodItemSeparator} />}
                    contentContainerStyle={styles.foodListContent}
                  />
                ) : (
                  <View style={styles.emptyMealContainer}>
                    <MaterialCommunityIcons name="food-off" size={48} color={theme.colors.text.secondary} style={{ opacity: 0.5 }} />
                    <Text style={styles.emptyMealText}>Bu öğün için besin eklenmemiş</Text>
                  </View>
                )}
                
                <TouchableOpacity 
                  style={styles.addFoodButton}
                  onPress={() => {/* TODO: Besin ekleme işlemi */}}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="#fff" />
                  <Text style={styles.addFoodButtonText}>Besin Ekle</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        ))}
      </View>
      
      {/* Su Takibi */}
      <Card style={styles.waterCard}>
        <View style={styles.waterHeader}>
          <View style={styles.waterHeaderLeft}>
            <MaterialCommunityIcons name="cup-water" size={24} color="#2196F3" />
            <Text style={styles.waterTitle}>Su Takibi</Text>
          </View>
          <Text style={styles.waterAmount}>1.2 / 2.5 L</Text>
        </View>
        
        <View style={styles.waterProgressContainer}>
          <View style={styles.waterProgress}>
            <View style={[styles.waterProgressBar, { width: '48%' }]} />
          </View>
        </View>
        
        <View style={styles.waterButtonsContainer}>
          {[100, 250, 500].map((amount) => (
            <TouchableOpacity 
              key={amount} 
              style={styles.waterButton}
              onPress={() => {/* TODO: Su ekleme işlemi */}}
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
        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
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
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 16,
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
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dateText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginTop: 8,
    marginBottom: 12,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 20,
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
  calorieContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    justifyContent: 'space-between',
  },
  calorieTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  calorieLabel: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  calorieProgressContainer: {
    flex: 1,
    marginLeft: 20,
  },
  calorieProgress: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  calorieProgressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 6,
  },
  calorieTarget: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  macroPercent: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  macroItemValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  macroItemLabel: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  mealsSection: {
    marginBottom: 20,
  },
  mealCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  mealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  mealTime: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealCaloriesWrapper: {
    alignItems: 'flex-end',
    marginRight: 10,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    textAlign: 'right',
  },
  mealItemCount: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    textAlign: 'right',
  },
  mealContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  foodListContent: {
    paddingBottom: 8,
  },
  foodItemSeparator: {
    height: 8,
  },
  emptyMealContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyMealText: {
    color: theme.colors.text.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  foodItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  foodImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodImage: {
    width: 24,
    height: 24,
  },
  foodInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  foodPortion: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  },
  foodMacros: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  caloriesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  macroRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  macroText: {
    fontSize: 10,
    color: theme.colors.text.secondary,
    marginHorizontal: 2,
  },
  addFoodButton: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  addFoodButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  waterCard: {
    marginBottom: 24,
    padding: 16,
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
    color: '#2196F3',
  },
  waterProgressContainer: {
    marginBottom: 16,
  },
  waterProgress: {
    height: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 6,
  },
  waterProgressBar: {
    height: '100%',
    backgroundColor: '#2196F3',
    borderRadius: 6,
  },
  waterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  waterButton: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  waterButtonText: {
    color: '#2196F3',
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