import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

type IconName = 'person-outline' | 'information-circle-outline' | 'fitness-outline' | 
  'notifications-outline' | 'settings-outline' | 'help-circle-outline' | 'log-out-outline';

interface MenuItem {
  title: string;
  icon: IconName;
  onPress: () => void;
  danger?: boolean;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const menuItems: MenuItem[] = [
    {
      title: 'Profili Düzenle',
      icon: 'person-outline',
      onPress: () => router.push('/modals/edit-profile'),
    },
    {
      title: 'Kişisel Bilgiler',
      icon: 'information-circle-outline',
      onPress: () => router.push('/modals/personal-info'),
    },
    {
      title: 'Fitness Hedefleri',
      icon: 'fitness-outline',
      onPress: () => router.push('/modals/fitness-goals'),
    },
    {
      title: 'Bildirim Ayarları',
      icon: 'notifications-outline',
      onPress: () => router.push('/modals/notifications'),
    },
    {
      title: 'Uygulama Ayarları',
      icon: 'settings-outline',
      onPress: () => router.push('/modals/settings'),
    },
    {
      title: 'Yardım ve Destek',
      icon: 'help-circle-outline',
      onPress: () => router.push('/modals/help'),
    },
    {
      title: 'Çıkış Yap',
      icon: 'log-out-outline',
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Ad Soyad</Text>
        <Text style={styles.value}>{user?.name}</Text>
        
        <Text style={styles.label}>E-posta</Text>
        <Text style={styles.value}>{user?.email}</Text>
        
        <Text style={styles.label}>Boy</Text>
        <Text style={styles.value}>{user?.height} cm</Text>
        
        <Text style={styles.label}>Kilo</Text>
        <Text style={styles.value}>{user?.weight} kg</Text>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, item.danger && styles.dangerItem]}
            onPress={item.onPress}
          >
            <Ionicons name={item.icon} size={24} color={item.danger ? '#ff3b30' : '#000'} />
            <Text style={[styles.menuText, item.danger && styles.dangerText]}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
  },
  infoContainer: {
    backgroundColor: '#f9f9f9',
    margin: 20,
    padding: 20,
    borderRadius: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    marginBottom: 15,
  },
  menuContainer: {
    margin: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
  },
  dangerItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  dangerText: {
    color: '#ff3b30',
  },
}); 