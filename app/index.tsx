import { View, StyleSheet, Alert, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Button } from '../src/components/Button';
import { Input } from '../src/components/Input';
import { Card } from '../src/components/Card';
import { theme } from '../src/theme';
import { StyleGuide } from '../src/styles/StyleGuide';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        Alert.alert('Hata', 'Email ve şifre alanları zorunludur');
        return;
      }
      await login(email, password);
      router.replace('/(tabs)');
    } catch (err) {
      Alert.alert('Hata', 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  return (
    <View style={styles.container}>
      <Card variant="elevated" style={styles.card}>
        <Input
          label="E-posta"
          placeholder="E-posta adresinizi girin"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={error || undefined}
        />
        
        <Input
          label="Şifre"
          placeholder="Şifrenizi girin"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={error || undefined}
        />
        
        <Button
          title="Giriş Yap"
          onPress={handleLogin}
          variant="primary"
          size="large"
          loading={loading}
          disabled={!email || !password}
        />

        <Button
          title="Kayıt Ol"
          onPress={handleRegister}
          variant="outline"
          size="large"
          style={styles.registerButton}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: StyleGuide.layout.screenPadding,
    justifyContent: 'center',
  } as ViewStyle,
  card: {
    marginBottom: StyleGuide.layout.containerSpacing,
  } as ViewStyle,
  registerButton: {
    marginTop: StyleGuide.layout.elementSpacing,
  } as ViewStyle,
}); 