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

// Örnek besin verileri
const SAMPLE_FOODS: FoodItem[] = [
  { id: 1, name: 'Yulaf Ezmesi', calories: 150, protein: 5, carbs: 27, fat: 3, portion: '40g', mealType: 'breakfast', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674446.png' },
  { id: 2, name: 'Tam Yağlı Süt', calories: 120, protein: 3.2, carbs: 4.8, fat: 3.6, portion: '200ml', mealType: 'breakfast', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674504.png' },
  { id: 3, name: 'Tavuk Göğsü', calories: 165, protein: 31, carbs: 0, fat: 3.6, portion: '100g', mealType: 'lunch', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674477.png' },
  { id: 4, name: 'Pirinç', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, portion: '100g', mealType: 'lunch', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674486.png' },
  { id: 5, name: 'Elma', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, portion: '1 adet', mealType: 'snack', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674494.png' },
  { id: 6, name: 'Somon', calories: 206, protein: 22, carbs: 0, fat: 13, portion: '100g', mealType: 'dinner', image: 'https://cdn-icons-png.flaticon.com/128/2674/2674442.png' },
];

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
  foods: typeof SAMPLE_FOODS;
}

// Günün saatine göre selamlama mesajı
const greeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Günaydın';
  if (hours < 18) return 'İyi günler';
  return 'İyi akşamlar';
};

// Yapay zeka beslenme önerileri arayüzü
interface INutritionRecommendation {
  recommendations: string[];
  meals: {
    type: string;
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    description?: string;
    ingredients?: {
      name: string;
      amount: string;
      calories: number;
    }[];
    recipe?: string;
  }[];
}

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
  const [nutritionRecommendation, setNutritionRecommendation] = useState<INutritionRecommendation | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [dailySummary, setDailySummary] = useState({
    calories: { consumed: 1450, target: 2000 },
    protein: { consumed: 90, target: 120 },
    carbs: { consumed: 160, target: 220 },
    fat: { consumed: 45, target: 65 }
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
    fetchNutritionRecommendation();
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
      
      // Örnek besinler - gerçek uygulamada API'den alınacak
      const updatedMealTypes = [...MEAL_TYPES];
      
      // Her öğüne rastgele besinler ekle
      updatedMealTypes.forEach((meal, index) => {
        const foodCount = Math.floor(Math.random() * 4); // 0-3 arası yemek
        
        const foods: FoodItem[] = [];
        for (let i = 0; i < foodCount; i++) {
          foods.push({
            id: i + 1,
            name: ['Elma', 'Yulaf', 'Tavuk Göğsü', 'Badem', 'Yumurta', 'Yoğurt', 'Peynir', 'Ekmek', 'Patates Püresi', 'Köfte'][Math.floor(Math.random() * 10)],
            portion: ['100g', '1 porsiyon', '1 adet', '30g', '200ml'][Math.floor(Math.random() * 5)],
            calories: Math.floor(Math.random() * 300) + 50,
            protein: Math.floor(Math.random() * 20) + 2,
            carbs: Math.floor(Math.random() * 30) + 5,
            fat: Math.floor(Math.random() * 15) + 1,
            mealType: meal.id,
            image: 'https://cdn-icons-png.flaticon.com/128/2674/2674446.png'
          });
        }
        
        updatedMealTypes[index].foods = foods;
      });
      
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

  const fetchNutritionRecommendation = async () => {
    try {
      if (!user?.id) {
        console.error('Kullanıcı kimliği bulunamadı');
        return;
      }
      
      setIsLoading(true);
      const recommendation = await api.getNutritionRecommendation(user.id, selectedDate);
      
      if (recommendation) {
        console.log('Beslenme önerisi alındı:', recommendation);
        setNutritionRecommendation(recommendation);
        
        // Eğer öneri varsa ve kullanıcı henüz kendi beslenme planını oluşturmamışsa
        // önerileri otomatik olarak gösteriyoruz
        if (recommendation.meals && recommendation.meals.length > 0) {
          const currentDate = new Date();
          if (isSameDay(selectedDate, currentDate)) {
            setShowRecommendations(true);
          }
        }
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Beslenme önerileri alınamadı:', error);
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    await fetchNutritionRecommendation();
    setRefreshing(false);
  }, [selectedDate]);

  const navigateDate = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setSelectedDate(addDays(selectedDate, 1));
    } else {
      setSelectedDate(subDays(selectedDate, 1));
    }
  };

  const renderFoodItem = ({ item }: { item: typeof SAMPLE_FOODS[0] }) => (
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

      {/* Yapay Zeka Beslenme Önerileri */}
      {nutritionRecommendation && (
        <Card style={styles.aiRecommendationCard}>
          <View style={styles.aiRecommendationHeader}>
            <View style={styles.aiRecommendationHeaderLeft}>
              <MaterialCommunityIcons name="robot" size={24} color={theme.colors.primary} />
              <Text style={styles.aiRecommendationTitle}>Yapay Zeka Beslenme Önerileri</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowRecommendations(!showRecommendations)}
              style={styles.toggleButton}
            >
              <Text style={styles.toggleButtonText}>
                {showRecommendations ? 'Gizle' : 'Göster'}
              </Text>
              <MaterialCommunityIcons 
                name={showRecommendations ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={theme.colors.primary} 
              />
            </TouchableOpacity>
          </View>

          {showRecommendations && (
            <View style={styles.aiRecommendationContent}>
              {nutritionRecommendation.recommendations && nutritionRecommendation.recommendations.length > 0 && (
                <View style={styles.recommendationNotesContainer}>
                  <Text style={styles.recommendationNotesTitle}>Beslenme Önerileri:</Text>
                  {nutritionRecommendation.recommendations.map((recommendation, index) => (
                    <View key={index} style={styles.recommendationItem}>
                      <MaterialCommunityIcons name="information" size={16} color={theme.colors.primary} />
                      <Text style={styles.recommendationText}>{recommendation}</Text>
                    </View>
                  ))}
                </View>
              )}

              {nutritionRecommendation.meals.map((meal, index) => (
                <Surface key={index} style={styles.recommendedMealItem}>
                  <View style={styles.recommendedMealHeader}>
                    <View style={styles.recommendedMealHeaderLeft}>
                      <MaterialCommunityIcons 
                        name={
                          meal.type === 'breakfast' ? 'food-apple' : 
                          meal.type === 'lunch' ? 'food' : 
                          meal.type === 'dinner' ? 'food-turkey' : 'food-apple-outline'
                        } 
                        size={24} 
                        color={
                          meal.type === 'breakfast' ? '#FF9500' : 
                          meal.type === 'lunch' ? '#4CAF50' : 
                          meal.type === 'dinner' ? '#2196F3' : '#9C27B0'
                        } 
                      />
                      <View>
                        <Text style={styles.recommendedMealType}>
                          {meal.type === 'breakfast' ? 'Kahvaltı' : 
                          meal.type === 'lunch' ? 'Öğle Yemeği' : 
                          meal.type === 'dinner' ? 'Akşam Yemeği' : 'Atıştırmalık'}
                        </Text>
                        <Text style={styles.recommendedMealName}>{meal.name}</Text>
                      </View>
                    </View>
                    <View style={styles.recommendedMealNutrition}>
                      <Text style={styles.recommendedMealCalories}>{meal.calories} kcal</Text>
                      <View style={styles.macroRow}>
                        <Text style={styles.macroText}>P: {meal.protein}g</Text>
                        <Text style={styles.macroText}>K: {meal.carbs}g</Text>
                        <Text style={styles.macroText}>Y: {meal.fat}g</Text>
                      </View>
                    </View>
                  </View>

                  {meal.description && (
                    <Text style={styles.recommendedMealDescription}>{meal.description}</Text>
                  )}

                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <View style={styles.ingredientsContainer}>
                      <Text style={styles.ingredientsTitle}>Malzemeler:</Text>
                      {meal.ingredients.map((ingredient, idx) => (
                        <View key={idx} style={styles.ingredientItem}>
                          <Text style={styles.ingredientName}>• {ingredient.name} ({ingredient.amount})</Text>
                          <Text style={styles.ingredientCalories}>{ingredient.calories} kcal</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {meal.recipe && (
                    <View style={styles.recipeContainer}>
                      <Text style={styles.recipeTitle}>Hazırlanışı:</Text>
                      <Text style={styles.recipeText}>{meal.recipe}</Text>
                    </View>
                  )}

                  <View style={styles.recommendationButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.recommendationButton}
                      onPress={() => {
                        Alert.alert('Menüye Ekle', 'Bu yemek planınıza eklenecek');
                        // TODO: Öğünü kişisel beslenme planına ekle
                      }}
                    >
                      <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                      <Text style={styles.recommendationButtonText}>Menüme Ekle</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.recommendationButton, styles.outlineButton]}
                      onPress={() => {
                        Alert.alert('Alternatif İste', 'Bu öğün için alternatif öneriler istenecek');
                        // TODO: Alternatif öğün önerisi iste
                      }}
                    >
                      <MaterialCommunityIcons name="refresh" size={16} color={theme.colors.primary} />
                      <Text style={[styles.recommendationButtonText, styles.outlineButtonText]}>Alternatif İste</Text>
                    </TouchableOpacity>
                  </View>
                </Surface>
              ))}
            </View>
          )}
        </Card>
      )}

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
  aiRecommendationCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: `${theme.colors.primary}40`,
  },
  aiRecommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: `${theme.colors.primary}08`,
  },
  aiRecommendationHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiRecommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  toggleButtonText: {
    fontSize: 12,
    color: theme.colors.primary,
    marginRight: 4,
  },
  aiRecommendationContent: {
    padding: 16,
  },
  recommendationNotesContainer: {
    backgroundColor: `${theme.colors.primary}08`,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  recommendationNotesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    flex: 1,
    marginLeft: 8,
  },
  recommendedMealItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  recommendedMealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  recommendedMealHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedMealType: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginLeft: 8,
  },
  recommendedMealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  recommendedMealNutrition: {
    alignItems: 'flex-end',
  },
  recommendedMealCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  recommendedMealDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  ingredientsContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ingredientName: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  ingredientCalories: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  recipeContainer: {
    marginTop: 12,
    marginBottom: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  recipeText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  recommendationButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  recommendationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 4,
  },
  recommendationButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  outlineButtonText: {
    color: theme.colors.primary,
  },
}); 