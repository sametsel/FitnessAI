import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Surface, useTheme, Divider, Button, Card, Title, ProgressBar, Chip } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

type IconName = 'person-outline' | 'information-circle-outline' | 'fitness-outline' | 
  'notifications-outline' | 'settings-outline' | 'help-circle-outline' | 'log-out-outline';

interface MenuItem {
  title: string;
  icon: IconName;
  onPress: () => void;
  description?: string;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const theme = useTheme();

  // Günün saatine göre selamlama mesajı
  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
  };

  const menuItems: MenuItem[] = [
    {
      title: 'Profili Düzenle',
      icon: 'person-outline',
      description: 'Kişisel bilgilerinizi güncelleyin',
      onPress: () => router.push('/modals/edit-profile'),
    },
    {
      title: 'Kişisel Bilgiler',
      icon: 'information-circle-outline',
      description: 'Boy, kilo, yaş bilgilerinizi yönetin',
      onPress: () => router.push('/modals/personal-info'),
    },
    {
      title: 'Fitness Hedefleri',
      icon: 'fitness-outline',
      description: 'Hedeflerinizi belirleyin ve takip edin',
      onPress: () => router.push('/modals/fitness-goals'),
    },
    {
      title: 'Bildirim Ayarları',
      icon: 'notifications-outline',
      description: 'Bildirim tercihlerinizi ayarlayın',
      onPress: () => router.push('/modals/notifications'),
    },
    {
      title: 'Uygulama Ayarları',
      icon: 'settings-outline',
      description: 'Uygulama tercihlerinizi düzenleyin',
      onPress: () => router.push('/modals/settings'),
    },
    {
      title: 'Yardım ve Destek',
      icon: 'help-circle-outline',
      description: 'SSS ve destek hizmetleri',
      onPress: () => router.push('/modals/help'),
    },
    {
      title: 'Çıkış Yap',
      icon: 'log-out-outline',
      description: 'Oturumunuzu sonlandırın',
      onPress: logout,
      danger: true,
    },
  ];

  const getActivityLevelText = (level?: string) => {
    switch (level) {
      case 'sedanter': return 'Sedanter (Hareketsiz)';
      case 'hafif_aktif': return 'Hafif Aktif';
      case 'orta_aktif': return 'Orta Aktif';
      case 'cok_aktif': return 'Çok Aktif';
      default: return 'Belirtilmemiş';
    }
  };

  const getGoalText = (goal?: string) => {
    switch (goal) {
      case 'kilo_verme': return 'Kilo Verme';
      case 'kilo_alma': return 'Kilo Alma';
      case 'kas_kazanma': return 'Kas Kazanma';
      case 'form_koruma': return 'Form Koruma';
      default: return 'Belirtilmemiş';
    }
  };

  // Vücut Kitle İndeksi hesaplama
  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;
    
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Zayıf', color: '#3498db' };
    if (bmi < 25) return { text: 'Normal', color: '#2ecc71' };
    if (bmi < 30) return { text: 'Fazla Kilolu', color: '#f39c12' };
    return { text: 'Obez', color: '#e74c3c' };
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

  // Varsayılan ilerleme verileri (gerçek verilerle değiştirilecek)
  const progressData = {
    workoutCompletion: 0.75, // %75 tamamlama
    goalProgress: 0.6, // %60 hedefe ulaşma
    nutritionAdherence: 0.85, // %85 beslenme planına uyum
  };

  return (
    <ScrollView style={styles.container}>
      {/* Üst Başlık Kısmı */}
      <LinearGradient
        colors={['#00adf5', '#0088cc']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 0}}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <View style={styles.userInfoContainer}>
            <Avatar.Image 
              source={{uri: user?.profilePicture || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User')}} 
              size={80} 
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.greetingText}>{getGreetingMessage()},</Text>
              <Text style={styles.nameText}>{user?.name || 'Kullanıcı'}</Text>
              <Chip 
                icon="email" 
                style={styles.emailChip} 
                textStyle={styles.emailChipText}
              >
                {user?.email}
              </Chip>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Özet Kartları */}
      <View style={styles.statsContainer}>
        <Surface style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <FontAwesome5 name="weight" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{user?.weight || '--'} kg</Text>
            <Text style={styles.statLabel}>Kilo</Text>
          </View>
        </Surface>
        
        <Surface style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons name="human-male-height" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{user?.height || '--'} cm</Text>
            <Text style={styles.statLabel}>Boy</Text>
          </View>
        </Surface>
        
        <Surface style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <FontAwesome5 name="heartbeat" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.statContent}>
            <Text style={styles.statValue}>{bmi || '--'}</Text>
            <Text style={styles.statLabel}>VKİ</Text>
          </View>
        </Surface>
      </View>

      {/* VKİ Kartı */}
      {bmi && bmiCategory && (
        <Card style={styles.bmiCard}>
          <Card.Content>
            <View style={styles.cardTitleContainer}>
              <MaterialCommunityIcons name="scale-bathroom" size={22} color={theme.colors.primary} />
              <Title style={styles.cardTitle}>Vücut Kitle İndeksi</Title>
            </View>
            
            <View style={styles.bmiContainer}>
              <View style={[styles.bmiValueContainer, { backgroundColor: bmiCategory.color + '22' }]}>
                <Text style={[styles.bmiValue, { color: bmiCategory.color }]}>{bmi}</Text>
                <Text style={[styles.bmiCategory, { color: bmiCategory.color }]}>{bmiCategory.text}</Text>
              </View>
              
              <View style={styles.bmiScaleContainer}>
                <View style={styles.bmiScale}>
                  <View style={[styles.bmiScalePart, { flex: 18.5, backgroundColor: '#3498db' }]} />
                  <View style={[styles.bmiScalePart, { flex: 6.5, backgroundColor: '#2ecc71' }]} />
                  <View style={[styles.bmiScalePart, { flex: 5, backgroundColor: '#f39c12' }]} />
                  <View style={[styles.bmiScalePart, { flex: 10, backgroundColor: '#e74c3c' }]} />
                </View>
                <View style={styles.bmiLabels}>
                  <Text style={styles.bmiLabel}>Zayıf</Text>
                  <Text style={styles.bmiLabel}>Normal</Text>
                  <Text style={styles.bmiLabel}>Kilolu</Text>
                  <Text style={styles.bmiLabel}>Obez</Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}

      {/* İlerleme Kartı */}
      <Card style={styles.progressCard}>
        <Card.Content>
          <View style={styles.cardTitleContainer}>
            <FontAwesome5 name="chart-line" size={20} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>İlerleme Durumu</Title>
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Antrenman Tamamlama</Text>
              <Text style={styles.progressValue}>{progressData.workoutCompletion * 100}%</Text>
            </View>
            <ProgressBar 
              progress={progressData.workoutCompletion} 
              color="#4CAF50" 
              style={styles.progressBar} 
            />
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Hedef İlerlemesi</Text>
              <Text style={styles.progressValue}>{progressData.goalProgress * 100}%</Text>
            </View>
            <ProgressBar 
              progress={progressData.goalProgress} 
              color="#FF9800" 
              style={styles.progressBar} 
            />
          </View>
          
          <View style={styles.progressItem}>
            <View style={styles.progressLabelContainer}>
              <Text style={styles.progressLabel}>Beslenme Planı Uyumu</Text>
              <Text style={styles.progressValue}>{progressData.nutritionAdherence * 100}%</Text>
            </View>
            <ProgressBar 
              progress={progressData.nutritionAdherence} 
              color="#2196F3" 
              style={styles.progressBar} 
            />
          </View>
        </Card.Content>
      </Card>

      {/* Menü Öğeleri */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <View style={styles.cardTitleContainer}>
            <MaterialCommunityIcons name="menu" size={22} color={theme.colors.primary} />
            <Title style={styles.cardTitle}>Profil Menüsü</Title>
          </View>
          
          {menuItems.map((item, index) => (
            <React.Fragment key={index}>
              <TouchableOpacity
                style={[styles.menuItem, item.danger && styles.dangerItem]}
                onPress={item.onPress}
              >
                <View style={styles.menuIconContainer}>
                  <Ionicons 
                    name={item.icon} 
                    size={24} 
                    color={item.danger ? '#ff3b30' : theme.colors.primary} 
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={[styles.menuTitle, item.danger && styles.dangerText]}>
                    {item.title}
                  </Text>
                  {item.description && (
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  )}
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color={item.danger ? '#ff3b30' : '#999'} 
                />
              </TouchableOpacity>
              {index < menuItems.length - 1 && !item.danger && <Divider style={styles.divider} />}
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
      
      {/* Uygulama Versiyonu */}
      <Text style={styles.versionText}>Uygulama Versiyonu: 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  headerContent: {
    alignItems: 'center',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 20,
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
    marginBottom: 4,
  },
  emailChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    height: 30,
    marginTop: 5,
  },
  emailChipText: {
    color: 'white',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  statCard: {
    width: (width - 45) / 3,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  bmiCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  progressCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
  },
  menuCard: {
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 2,
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
  bmiContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bmiValueContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  bmiValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  bmiCategory: {
    fontSize: 12,
  },
  bmiScaleContainer: {
    flex: 1,
  },
  bmiScale: {
    height: 10,
    borderRadius: 5,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 5,
  },
  bmiScalePart: {
    height: '100%',
  },
  bmiLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiLabel: {
    fontSize: 10,
    color: '#666',
  },
  progressItem: {
    marginBottom: 15,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
  },
  progressValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  divider: {
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuDescription: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  dangerItem: {
    marginTop: 10,
    backgroundColor: '#fff5f5',
    borderRadius: 10,
    padding: 5,
  },
  dangerText: {
    color: '#ff3b30',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginBottom: 25,
    marginTop: 10,
  }
}); 