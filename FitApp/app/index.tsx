import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { Text } from 'react-native-paper';

export default function Index() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Render tamamlandıktan ve layout mount olduktan sonra navigasyonu yap
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      if (user) {
        // User var ise tabs'e git
        router.push('/(tabs)');
      } else {
        // User yok ise login'e git
        router.push('/(auth)/login');
      }
    }, 1000); // 1 saniye bekleme - navigasyon hatasını önler

    return () => clearTimeout(timer);
  }, [user]);

  // Loading ekranı göster, navigasyonu useEffect içinde yap
  return (
    <View style={styles.container}>
      <Text style={styles.title}>FitApp</Text>
      <ActivityIndicator size="large" color="#00adf5" style={styles.loader} />
      <Text style={styles.subtitle}>Yükleniyor...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
}); 