// native_assignment/screens/ReviewInspectionScreen.tsx
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Types & Constants
import { NewInspectionStackParamList } from '../types/navigation';
import { Inspection, Category, RiskLevel } from '../types/inspection';
import { COLORS } from '../constants/colors';
import { GROUP_CONFIG } from '../constants/groupConfig';

// Context & Utils
import { useInspections } from '../context/InspectionContext';
import { generateInspectionId } from '../utils/id';
import { formatInspectionTimestamp } from '../utils/date';

// Components
import AppHeader from '../components/AppHeader';
import InspectionSummary from '../components/InspectionSummary';

type NavigationProp = NativeStackNavigationProp<NewInspectionStackParamList, 'ReviewInspection'>;

export default function ReviewInspectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { draft, addInspection, resetDraft } = useInspections();

  const finalInspection: Inspection = useMemo(() => {
    return {
      id: generateInspectionId(),
      vendorAlias: draft.vendorAlias,
      stallCode: draft.stallCode,
      category: (draft.category as Category) || 'General Goods',
      contactNumber: draft.contactNumber,
      riskLevel: (draft.riskLevel as RiskLevel) || 'Low',
      consent: draft.consent,
      imageUri: draft.imageUri,
      timestamp: formatInspectionTimestamp(new Date()),
      groupVerificationCode: GROUP_CONFIG.verificationCode,
    };
  }, [draft]);

  const handleSave = () => {
    addInspection(finalInspection);
    resetDraft();
    navigation.replace('SaveSuccess');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Review Inspection" 
        showBackButton 
        onBackPress={handleBack} 
        showGroupCode={true} 
      />

      <ScrollView 
        style={styles.flex} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Review Details</Text>
          <Text style={styles.stepIndicator}>
            Step 3 of 3: Confirm and Save
          </Text>
        </View>

        <Text style={styles.instructionText}>
          Please verify all information is correct before saving this inspection to your records.
        </Text>

        <InspectionSummary inspection={finalInspection} showImage={true} />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Save Inspection</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  flex: { 
    flex: 1 
  },
  scrollContent: { 
    padding: 20, 
    paddingBottom: 40 
  },
  titleSection: { 
    marginBottom: 16 
  },
  pageTitle: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: COLORS.textPrimary, 
    marginBottom: 4 
  },
  stepIndicator: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    fontWeight: '500' 
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: { 
    marginTop: 24, 
    gap: 12 
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
    fontWeight: '700' 
  },
});