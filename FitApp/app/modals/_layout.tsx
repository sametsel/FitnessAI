import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        presentation: 'modal',
        animation: 'slide_from_bottom',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#000',
      }}
    >
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Profili Düzenle',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="personal-info" 
        options={{ 
          title: 'Kişisel Bilgiler',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="fitness-goals" 
        options={{ title: 'Fitness Hedefleri' }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ title: 'Bildirim Ayarları' }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ title: 'Uygulama Ayarları' }} 
      />
      <Stack.Screen 
        name="help" 
        options={{ title: 'Yardım ve Destek' }} 
      />
    </Stack>
  );
} 