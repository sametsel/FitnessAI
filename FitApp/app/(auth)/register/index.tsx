import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../../src/context/AuthContext';
import { Picker } from '@react-native-picker/picker';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { theme } from '../../../src/theme/theme';
import { StyleGuide } from '../../../src/styles/StyleGuide';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    height: '',
    weight: '',
    gender: 'erkek',
    activityLevel: 'sedanter',
    goals: 'form_koruma'
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(1);
  
  const { register, loading } = useAuth();
  
  const updateFormData = (key: string, value: string) => {
    setFormData(prevData => ({
      ...prevData,
      [key]: value
    }));
    
    // Hata varsa temizle
    if (errors[key]) {
      setErrors(prevErrors => {
        const newErrors = {...prevErrors};
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    // Ad Soyad kontrolü
    if (!formData.name.trim()) {
      newErrors.name = 'Ad Soyad alanı zorunludur';
    }
    
    // E-posta kontrolü
    if (!formData.email.trim()) {
      newErrors.email = 'E-posta alanı zorunludur';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    // Şifre kontrolü
    if (!formData.password) {
      newErrors.password = 'Şifre alanı zorunludur';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    // Şifre tekrar kontrolü
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    // Yaş kontrolü
    if (!formData.age) {
      newErrors.age = 'Yaş alanı zorunludur';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 13 || age > 100) {
        newErrors.age = 'Geçerli bir yaş giriniz (13-100)';
      }
    }
    
    // Boy kontrolü
    if (!formData.height) {
      newErrors.height = 'Boy alanı zorunludur';
    } else {
      const height = parseInt(formData.height);
      if (isNaN(height) || height < 100 || height > 250) {
        newErrors.height = 'Geçerli bir boy giriniz (100-250 cm)';
      }
    }
    
    // Kilo kontrolü
    if (!formData.weight) {
      newErrors.weight = 'Kilo alanı zorunludur';
    } else {
      const weight = parseInt(formData.weight);
      if (isNaN(weight) || weight < 30 || weight > 300) {
        newErrors.weight = 'Geçerli bir kilo giriniz (30-300 kg)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleRegister = async () => {
    if (!validateStep2()) {
      return;
    }

    try {
      await register(formData);
      console.log('Kayıt başarılı, yönlendiriliyor...');
    } catch (error) {
      console.error('Kayıt hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
      Alert.alert('Kayıt Başarısız', errorMessage);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepIndicator}>Adım 1/2: Hesap Bilgileri</Text>
      
      <Input
        label="Ad Soyad"
        value={formData.name}
        onChangeText={(text) => updateFormData('name', text)}
        placeholder="Ad Soyad giriniz"
        error={errors.name}
      />

      <Input
        label="E-posta"
        value={formData.email}
        onChangeText={(text) => updateFormData('email', text)}
        placeholder="E-posta adresinizi giriniz"
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <View style={styles.passwordContainer}>
        <Input
          label="Şifre"
          value={formData.password}
          onChangeText={(text) => updateFormData('password', text)}
          placeholder="Şifrenizi giriniz"
          secureTextEntry={!showPassword}
          error={errors.password}
          style={{ flex: 1 }}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons 
            name={showPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.passwordContainer}>
        <Input
          label="Şifre Tekrar"
          value={formData.confirmPassword}
          onChangeText={(text) => updateFormData('confirmPassword', text)}
          placeholder="Şifrenizi tekrar giriniz"
          secureTextEntry={!showConfirmPassword}
          error={errors.confirmPassword}
          style={{ flex: 1 }}
        />
        <TouchableOpacity 
          style={styles.eyeIcon} 
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons 
            name={showConfirmPassword ? 'eye-off' : 'eye'} 
            size={24} 
            color={theme.colors.text.secondary} 
          />
        </TouchableOpacity>
      </View>

      <Button
        title="Devam Et"
        onPress={handleNextStep}
        style={styles.button}
        size="large"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepIndicator}>Adım 2/2: Kişisel Bilgiler</Text>
      
      <Input
        label="Yaş"
        value={formData.age}
        onChangeText={(text) => updateFormData('age', text)}
        placeholder="Yaşınızı giriniz"
        keyboardType="numeric"
        error={errors.age}
      />

      <Input
        label="Boy (cm)"
        value={formData.height}
        onChangeText={(text) => updateFormData('height', text)}
        placeholder="Boyunuzu giriniz"
        keyboardType="numeric"
        error={errors.height}
      />

      <Input
        label="Kilo (kg)"
        value={formData.weight}
        onChangeText={(text) => updateFormData('weight', text)}
        placeholder="Kilonuzu giriniz"
        keyboardType="numeric"
        error={errors.weight}
      />

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Cinsiyet</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.gender}
            onValueChange={(value) => updateFormData('gender', value)}
            style={styles.picker}
          >
            <Picker.Item label="Erkek" value="erkek" />
            <Picker.Item label="Kadın" value="kadın" />
            <Picker.Item label="Diğer" value="diger" />
          </Picker>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Aktivite Seviyesi</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.activityLevel}
            onValueChange={(value) => updateFormData('activityLevel', value)}
            style={styles.picker}
          >
            <Picker.Item label="Hareketsiz" value="sedanter" />
            <Picker.Item label="Az Hareketli" value="hafif_aktif" />
            <Picker.Item label="Orta Derece Aktif" value="orta_aktif" />
            <Picker.Item label="Aktif" value="aktif" />
            <Picker.Item label="Çok Aktif" value="cok_aktif" />
          </Picker>
        </View>
      </View>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Hedef</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={formData.goals}
            onValueChange={(value) => updateFormData('goals', value)}
            style={styles.picker}
          >
            <Picker.Item label="Kilo Verme" value="kilo_verme" />
            <Picker.Item label="Kilo Alma" value="kilo_alma" />
            <Picker.Item label="Kas Kazanma" value="kas_kazanma" />
            <Picker.Item label="Form Koruma" value="form_koruma" />
          </Picker>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <Button
          title="Geri"
          onPress={handlePrevStep}
          variant="outline"
          style={styles.buttonHalf}
          size="large"
        />
        <Button
          title="Kayıt Ol"
          onPress={handleRegister}
          loading={loading}
          style={styles.buttonHalf}
          size="large"
        />
      </View>
    </>
  );

  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.secondary]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {currentStep === 1 && (
              <View style={styles.headerContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons name="fitness-outline" size={40} color="white" />
                </View>
                <Text style={styles.headerTitle}>FitApp'e Hoş Geldiniz</Text>
              </View>
            )}
            <View style={styles.formContainer}>
              <Text style={styles.title}>Hesap Oluştur</Text>
              {currentStep === 1 ? renderStep1() : renderStep2()}
              
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.loginLinkText}>
                  Hesabınız var mı? <Text style={styles.loginLinkTextBold}>Giriş yapın</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: StyleGuide.layout.padding * 1.5,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 16,
    padding: StyleGuide.layout.padding * 1.5,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepIndicator: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  passwordContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    bottom: 17,
    zIndex: 1,
  },
  button: {
    marginTop: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  buttonHalf: {
    flex: 0.48,
  },
  pickerContainer: {
    marginBottom: StyleGuide.layout.spacing,
  },
  pickerLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: theme.colors.text.secondary,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: theme.colors.gray300,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: theme.colors.background.paper,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  loginLinkTextBold: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});