const Nutrition = require('../models/Nutrition');
const User = require('../models/User');
const axios = require('axios');

// Bugünkü beslenme verisi
exports.getTodayNutrition = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const nutrition = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: today }
    });
    res.status(200).json({ success: true, data: nutrition });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Belirli bir günün beslenme verisi
exports.getNutrition = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    queryDate.setHours(0,0,0,0);
    const nutrition = await Nutrition.findOne({
      userId: req.user.id,
      date: { $gte: queryDate }
    });
    res.status(200).json({ success: true, data: nutrition });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Yapay zeka tabanlı beslenme önerileri
exports.getNutritionRecommendations = async (req, res) => {
  try {
    const { date } = req.query;
    const queryDate = date ? new Date(date) : new Date();
    
    // Önce kullanıcı bilgilerini alalım
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }
    
    // Önceden kaydedilmiş öneri var mı diye kontrol edelim
    const existingRecommendation = await Nutrition.findOne({
      userId: req.user.id,
      date: { 
        $gte: new Date(queryDate.toISOString().split('T')[0]), 
        $lt: new Date(queryDate.toISOString().split('T')[0] + 'T23:59:59.999Z') 
      },
      'createdBy': 'ai'
    });
    
    if (existingRecommendation) {
      return res.status(200).json({ 
        success: true, 
        data: {
          userId: existingRecommendation.userId,
          date: existingRecommendation.date,
          meals: existingRecommendation.meals.map(meal => ({
            type: meal.type || 'other',
            name: meal.name,
            description: meal.description || '',
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            time: meal.time,
            ingredients: meal.ingredients || [],
            recipe: meal.recipe || '',
            image: meal.image || ''
          })),
          dailyCalories: existingRecommendation.totalCalories,
          dailyProtein: existingRecommendation.totalProtein,
          dailyCarbs: existingRecommendation.totalCarbs,
          dailyFat: existingRecommendation.totalFat,
          createdBy: 'ai',
          recommendations: existingRecommendation.recommendations || [],
          notes: existingRecommendation.notes || ''
        } 
      });
    }
    
    // Python yapay zeka API'si ile beslenme önerisi alalım
    try {
      const aiResponse = await axios.post(`${process.env.AI_API_URL}/api/nutrition/recommendations`, {
        user: {
          id: user._id.toString(),
          age: user.age,
          weight: user.weight,
          height: user.height,
          gender: user.gender,
          activityLevel: user.activityLevel,
          goal: user.goal
        },
        date: queryDate.toISOString().split('T')[0]
      });
      
      if (aiResponse.data && aiResponse.data.data) {
        return res.status(200).json({ success: true, data: aiResponse.data.data });
      } else {
        throw new Error('Yapay zeka servisi geçersiz yanıt döndürdü');
      }
    } catch (aiError) {
      console.error('Yapay zeka API hatası:', aiError);
      
      // Yapay zeka API'si çalışmadığında örnek veri döndür
      // Gerçek uygulamada bu kısmı kaldırabilir veya farklı bir hata yanıtı gönderebilirsiniz
      const sampleRecommendation = {
        userId: req.user.id,
        date: queryDate.toISOString().split('T')[0],
        meals: [
          {
            type: 'breakfast',
            name: 'Yulaf Ezmesi ve Meyve',
            description: 'Protein açısından zengin, sağlıklı bir kahvaltı',
            calories: 350,
            protein: 15,
            carbs: 45,
            fat: 10,
            time: '07:00 - 09:00',
            ingredients: [
              { name: 'Yulaf Ezmesi', amount: '50g', calories: 180 },
              { name: 'Süt', amount: '200ml', calories: 90 },
              { name: 'Muz', amount: '1 adet', calories: 80 }
            ],
            recipe: 'Yulaf ezmesini süt ile karıştırın ve 2-3 dakika pişirin. Üzerine dilimlenmiş muz ekleyin.'
          },
          {
            type: 'lunch',
            name: 'Tavuklu Salata',
            description: 'Protein ağırlıklı, hafif öğle yemeği',
            calories: 450,
            protein: 35,
            carbs: 30,
            fat: 15,
            time: '12:00 - 14:00',
            ingredients: [
              { name: 'Izgara Tavuk', amount: '100g', calories: 180 },
              { name: 'Karışık Salata', amount: '150g', calories: 30 },
              { name: 'Zeytinyağı', amount: '1 yemek kaşığı', calories: 120 },
              { name: 'Tam Buğday Ekmeği', amount: '1 dilim', calories: 120 }
            ],
            recipe: 'Tavuğu ızgarada pişirin. Salatayı hazırlayın ve üzerine zeytinyağı ve limon ekleyin. Tavuk ile servis edin.'
          },
          {
            type: 'dinner',
            name: 'Somon ve Sebzeler',
            description: 'Omega-3 açısından zengin, protein değeri yüksek akşam yemeği',
            calories: 550,
            protein: 40,
            carbs: 25,
            fat: 25,
            time: '18:00 - 20:00',
            ingredients: [
              { name: 'Somon Fileto', amount: '150g', calories: 280 },
              { name: 'Brokoli', amount: '100g', calories: 35 },
              { name: 'Karnabahar', amount: '100g', calories: 30 },
              { name: 'Zeytinyağı', amount: '1 yemek kaşığı', calories: 120 },
              { name: 'Limon', amount: '1/2 adet', calories: 10 }
            ],
            recipe: 'Somonu fırında veya ızgarada pişirin. Sebzeleri buharda pişirin. Zeytinyağı ve limon ile tatlandırın.'
          },
          {
            type: 'snack',
            name: 'Protein Bar ve Meyve',
            description: 'Enerji sağlayan, protein içeren atıştırmalık',
            calories: 200,
            protein: 15,
            carbs: 20,
            fat: 5,
            time: '15:00 - 16:00',
            ingredients: [
              { name: 'Protein Bar', amount: '1 adet', calories: 150 },
              { name: 'Elma', amount: '1/2 adet', calories: 50 }
            ],
            recipe: 'Protein barınızı elma ile tüketin.'
          }
        ],
        dailyCalories: 1550,
        dailyProtein: 105,
        dailyCarbs: 120,
        dailyFat: 55,
        createdBy: 'ai',
        recommendations: [
          'Günlük su tüketimini en az 2.5 litre olarak hedefleyin.',
          'Ana öğünler arasında 3-4 saat olmalıdır.',
          'Yüksek proteinli besinler kas yapımını destekler.',
          'Egzersizden sonraki 30-60 dakika içinde protein ve karbonhidrat alımı önemlidir.'
        ],
        notes: 'Bu beslenme planı sizin hedeflerinize göre hazırlanmıştır. Düzenli olarak takip etmeniz önerilir.'
      };
      
      return res.status(200).json({ success: true, data: sampleRecommendation });
    }
  } catch (error) {
    console.error('Beslenme önerileri alınamadı:', error);
    res.status(400).json({ success: false, message: error.message });
  }
}; 