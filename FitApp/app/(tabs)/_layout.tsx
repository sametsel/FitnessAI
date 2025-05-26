import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login/index');
    }
  }, [user, loading]);

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="workout/index"
        options={{
          title: 'Antrenman',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="dumbbell" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="nutrition/index"
        options={{
          title: 'Beslenme',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="food-apple" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
