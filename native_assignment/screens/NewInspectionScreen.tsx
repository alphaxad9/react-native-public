// native_assignment/screens/NewInspectionScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NewInspectionStackParamList } from '../types/navigation';
import { Category, RiskLevel } from '../types/inspection';
import { CATEGORIES } from '../constants/inspectionOptions';
import { COLORS } from '../constants/colors';
import { useInspections } from '../context/InspectionContext';
import { validateInspectionForm, ValidationErrors } from '../validation/inspectionValidation';


// Components
import AppHeader from '../components/AppHeader';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import RiskSelector from '../components/RiskSelector';
import ConsentCheckbox from '../components/ConsentCheckbox';

type NavigationProp = NativeStackNavigationProp<NewInspectionStackParamList, 'NewInspectionForm'>;


export default function NewInspectionScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { draft, updateDraft, resetDraft } = useInspections();

  // Local form state
  const [vendorAlias, setVendorAlias] = useState(draft.vendorAlias);
  const [stallCode, setStallCode] = useState(draft.stallCode);
  const [category, setCategory] = useState<Category | null>(draft.category);
  const [contactNumber, setContactNumber] = useState(draft.contactNumber);
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(draft.riskLevel);
  const [consent, setConsent] = useState(draft.consent);

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Sync local state back to the draft
  useEffect(() => {
    updateDraft({
      vendorAlias,
      stallCode,
      category,
      contactNumber,
      riskLevel,
      consent,
    });
  }, [vendorAlias, stallCode, category, contactNumber, riskLevel, consent, updateDraft]);

  // Recompute errors reactively
  useEffect(() => {
    if (submitted) {
      const newErrors = validateInspectionForm({
        vendorAlias,
        stallCode,
        category,
        contactNumber,
        riskLevel,
        consent,
      });
      setErrors(newErrors);
    }
  }, [vendorAlias, stallCode, category, contactNumber, riskLevel, consent, submitted]);


  const handleNext = () => {
    setSubmitted(true);

    const validationErrors = validateInspectionForm({
      vendorAlias,
      stallCode,
      category,
      contactNumber,
      riskLevel,
      consent,
    });

    setErrors(validationErrors);

    // Clean, fully typed string navigation (NO objects)
    if (Object.keys(validationErrors).length === 0) {
      navigation.navigate('AddEvidence');
    }
  };


  const handleReset = () => {
    setVendorAlias('');
    setStallCode('');
    setCategory(null);
    setContactNumber('');
    setRiskLevel(null);
    setConsent(false);
    setErrors({});
    setSubmitted(false);
    resetDraft();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="New Inspection" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleSection}>
            <Text style={styles.pageTitle}>New Inspection</Text>
            <Text style={styles.stepIndicator}>Step 1 of 3: Inspection Details</Text>
          </View>

          <FormInput
            label="Vendor Alias *"
            value={vendorAlias}
            onChangeText={setVendorAlias}
            placeholder="e.g. Vendor Alpha"
            error={submitted ? errors.vendorAlias : undefined}
          />

          <FormInput
            label="Stall Code *"
            value={stallCode}
            onChangeText={(text) => setStallCode(text.toUpperCase())}
            placeholder="e.g. ST-001"
            error={submitted ? errors.stallCode : undefined}
            maxLength={6}
          />
          <Text style={styles.hint}>Format: ST- followed by 3 digits (e.g. ST-001)</Text>

          <FormSelect
            label="Category *"
            options={CATEGORIES}
            selected={category}
            onSelect={(option) => setCategory(option as Category)}
            error={submitted ? errors.category : undefined}
          />

          <FormInput
            label="Contact Number *"
            value={contactNumber}
            onChangeText={setContactNumber}
            placeholder="e.g. +250781234567"
            keyboardType="phone-pad"
            error={submitted ? errors.contactNumber : undefined}
            maxLength={13}
          />
          <Text style={styles.hint}>Rwanda format: +250 followed by 9 digits</Text>

          <RiskSelector
            selected={riskLevel}
            onSelect={(level) => setRiskLevel(level)}
            error={submitted ? errors.riskLevel : undefined}
          />

          <ConsentCheckbox
            checked={consent}
            onToggle={() => setConsent(!consent)}
            error={submitted ? errors.consent : undefined}
          />

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Next: Add Evidence</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Clear Form</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  titleSection: { marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  stepIndicator: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '500' },
  hint: { fontSize: 12, color: COLORS.textSecondary, marginTop: -14, marginBottom: 16, fontStyle: 'italic' },
  buttonContainer: { marginTop: 12, gap: 12 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, gap: 8 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  secondaryButtonText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: '600' },
});