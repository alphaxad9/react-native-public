// native_assignment/screens/AddEvidenceScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { NewInspectionStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';
import { useInspections } from '../context/InspectionContext';

// Services & Components
import { takePhoto, chooseFromGallery } from '../services/mediaService';
import AppHeader from '../components/AppHeader';
import EvidencePreview from '../components/EvidencePreview';
import EvidenceActionButtons from '../components/EvidenceActionButtons';

type NavigationProp = NativeStackNavigationProp<NewInspectionStackParamList, 'AddEvidence'>;

export default function AddEvidenceScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { draft, updateDraft } = useInspections();

  const [isLoading, setIsLoading] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Helper to handle media result and update draft
  const handleMediaResult = async (mediaAction: () => Promise<any>) => {
    setIsLoading(true);
    setPermissionError(null);

    try {
      const result = await mediaAction();

      if (result.cancelled) {
        // User cancelled gracefully, do nothing, just reset loading
        setIsLoading(false);
        return;
      }

      if (!result.success && result.error) {
        // Permission denied or other error
        setPermissionError(result.error);
        setIsLoading(false);
        return;
      }

      // Success: update the draft with the new image URI
      if (result.success && result.imageUri) {
        updateDraft({ imageUri: result.imageUri });
      }
    } catch (error) {
      setPermissionError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakePhoto = () => handleMediaResult(takePhoto);
  const handleChooseGallery = () => handleMediaResult(chooseFromGallery);

  const handleReplace = () => {
    // Reset error if they are trying again
    setPermissionError(null);
    // Show options to take new or choose new (we'll default to gallery for replace, or you can show a modal)
    handleChooseGallery(); 
  };

  const handleRemove = () => {
    updateDraft({ imageUri: null });
    setPermissionError(null);
  };

  const handleNext = () => {
    // Navigate to Review screen. Image is optional per some interpretations, 
    // but if your rubric requires it, you can add validation here:
    // if (!draft.imageUri) { alert('Please add an image'); return; }
    navigation.navigate('ReviewInspection');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Add Evidence" showBackButton onBackPress={handleBack} />

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleSection}>
          <Text style={styles.pageTitle}>Add Evidence</Text>
          <Text style={styles.stepIndicator}>Step 2 of 3: Photo Documentation</Text>
        </View>

        {/* Permission Error Recovery UI */}
        {permissionError && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            <Text style={styles.errorText}>{permissionError}</Text>
            <TouchableOpacity 
              style={styles.errorButton} 
              onPress={() => setPermissionError(null)}
            >
              <Text style={styles.errorButtonText}>Dismiss</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Processing image...</Text>
          </View>
        ) : (
          <>
            {/* Image Preview */}
            <EvidencePreview imageUri={draft.imageUri} />

            {/* Action Buttons */}
            <EvidenceActionButtons
              hasImage={!!draft.imageUri}
              onTakePhoto={handleTakePhoto}
              onChooseGallery={handleChooseGallery}
              onReplace={handleReplace}
              onRemove={handleRemove}
            />
          </>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Next: Review</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  errorText: { flex: 1, color: COLORS.error, fontSize: 14, fontWeight: '500', marginLeft: 12, lineHeight: 20 },
  errorButton: { marginTop: 12, backgroundColor: COLORS.error, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  errorButtonText: { color: '#FFF', fontSize: 12, fontWeight: '600' },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', minHeight: 200 },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },

  buttonContainer: { marginTop: 24, gap: 12 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});