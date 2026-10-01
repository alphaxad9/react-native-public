// native_assignment/screens/SaveSuccessScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';


// Types & Constants
import { NewInspectionStackParamList, MainTabParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';

// Components
import AppHeader from '../components/AppHeader';

// Explicitly type the navigation prop for this screen
type NavigationProp = NativeStackNavigationProp<NewInspectionStackParamList, 'SaveSuccess'>;

export default function SaveSuccessScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleViewRecords = () => {
    // Navigate to the Records tab using the parent (tab) navigator
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Records' as keyof MainTabParamList);
    }
  };

  const handleNewInspection = () => {
    // Reset the inspection stack so pressing back doesn't return to Review.
    // "as const" tells TypeScript that this is the exact literal string, not a generic string.
    navigation.reset({
      index: 0,
      routes: [{ name: 'NewInspectionForm' as const }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Success" showGroupCode={false} />

      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={64} color={COLORS.primary} />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>Inspection Saved</Text>
        <Text style={styles.message}>
          The inspection has been successfully added to your records.
        </Text>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewRecords}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>View Records</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleNewInspection}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryButtonText}>New Inspection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    gap: 8,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '700',
  },
});