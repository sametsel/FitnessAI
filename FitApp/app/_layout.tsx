import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';

export default function RootLayout() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthProvider>
    </NavigationContainer>
  );
}
