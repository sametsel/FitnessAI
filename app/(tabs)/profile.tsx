import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { theme } from '../../src/theme';
import { Card } from '../../src/components/Card';
import { Header } from '../../src/components/Header';
import { StatItem } from '../../src/components/StatItem';
import { MenuItem } from '../../src/components/MenuItem';
import { StyleGuide } from '../../src/styles/StyleGuide';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  const navigateToModal = (route: string) => {
    router.push(`/modals/${route}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Header title="Profil" />
      
      {/* Profil Bilgileri */}
      <Card variant="elevated" style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.profileInfo}>
            <Text style={StyleGuide.typography.h2}>{user?.name || 'Kullanıcı'}</Text>
            <Text style={StyleGuide.typography.bodySmall}>{user?.email || 'kullanici@email.com'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigateToModal('edit-profile')}>
            <MaterialIcons 
              name="edit" 
              size={24} 
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>
      </Card>

      {/* İstatistikler */}
      <View style={styles.statsContainer}>
        <StatItem 
          icon="fitness-center"
          number="12" 
          label="Antrenman" 
        />
        <StatItem 
          icon="local-fire-department"
          number="1850" 
          label="Kalori" 
        />
        <StatItem 
          icon="directions-run"
          number="5.2" 
          label="Km" 
        />
      </View>

      {/* Menü Bölümü */}
      <View style={styles.menuSection}>
        <Text style={[StyleGuide.typography.h3, styles.menuTitle]}>
          Hesap Ayarları
        </Text>
        
        <MenuItem 
          icon="fitness-center" 
          title="Fitness Hedefleri" 
          onPress={() => navigateToModal('fitness-goals')} 
        />
        <MenuItem 
          icon="notifications-none" 
          title="Bildirim Ayarları" 
          onPress={() => navigateToModal('notifications')} 
        />
        <MenuItem 
          icon="settings" 
          title="Uygulama Ayarları" 
          onPress={() => navigateToModal('settings')} 
        />
        <MenuItem 
          icon="help-outline" 
          title="Yardım ve Destek" 
          onPress={() => navigateToModal('help')} 
        />
        <MenuItem 
          icon="logout" 
          title="Çıkış Yap" 
          onPress={handleLogout}
          textColor={theme.colors.error}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  profileCard: {
    margin: StyleGuide.layout.screenPadding,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: StyleGuide.layout.elementSpacing,
  },
  profileInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: StyleGuide.layout.screenPadding,
    marginBottom: StyleGuide.layout.sectionSpacing,
  },
  menuSection: {
    marginHorizontal: StyleGuide.layout.screenPadding,
    marginBottom: StyleGuide.layout.sectionSpacing,
  },
  menuTitle: {
    marginBottom: StyleGuide.layout.elementSpacing,
  },
}); 