import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="edit-profile" 
        options={{ 
          title: 'Profili Düzenle',
          presentation: 'modal'
        }} 
      />
      <Stack.Screen 
        name="personal-info" 
        options={{ title: 'Kişisel Bilgiler' }} 
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