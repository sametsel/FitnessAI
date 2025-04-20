import React, { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';

export default function Index() {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Index sayfası yüklendi, kullanıcı durumu:', user ? 'Giriş yapmış' : 'Giriş yapmamış');
  }, [user]);

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
} 