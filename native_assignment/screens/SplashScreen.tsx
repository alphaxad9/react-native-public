// native_assignment/screens/SplashScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { GROUP_CONFIG } from '../constants/groupConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const handleGetStarted = () => {
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconBox}>
          <Ionicons name="leaf" size={64} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>{GROUP_CONFIG.appName}</Text>
        <Text style={styles.verificationCode}>{GROUP_CONFIG.verificationCode}</Text>
        <Text style={styles.subtitle}>Field Inspection Prototype</Text>
        <Text style={styles.tagline}>Healthy Markets • Safer Communities</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleGetStarted}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.surface, 
    padding: 24, 
    justifyContent: 'space-between' 
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  iconBox: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: COLORS.primaryLight, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  title: { 
    fontSize: 28, 
    fontWeight: '800', 
    color: COLORS.textPrimary, 
    textAlign: 'center', 
    marginBottom: 8 
  },
  verificationCode: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  subtitle: { 
    fontSize: 16, 
    color: COLORS.textSecondary, 
    marginBottom: 24 
  },
  tagline: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: COLORS.primary, 
    letterSpacing: 0.5 
  },
  button: { 
    backgroundColor: COLORS.primary, 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '700' 
  },
});