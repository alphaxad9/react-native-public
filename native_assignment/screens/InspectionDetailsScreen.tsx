// native_assignment/screens/InspectionDetailsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';


// Types & Constants
import { RecordsStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';


// Context & Components
import { useInspections } from '../context/InspectionContext';
import AppHeader from '../components/AppHeader';
import InspectionSummary from '../components/InspectionSummary';
import EmptyState from '../components/EmptyState';


// Explicitly type the route and navigation props
type RouteProps = RouteProp<RecordsStackParamList, 'InspectionDetails'>;
type NavigationProp = NativeStackNavigationProp<RecordsStackParamList, 'InspectionDetails'>;


export default function InspectionDetailsScreen() {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { getInspectionById } = useInspections();

  // Extract the inspectionId passed from the Records screen
  const { inspectionId } = route.params;


  // Fetch the real saved inspection data from context
  const inspection = getInspectionById(inspectionId);

  
  const handleBack = () => {
    navigation.goBack();
  };

  // Fallback if the record is somehow not found (e.g., cleared state)
  if (!inspection) {
    return (
      <SafeAreaView style={styles.container}>
        <AppHeader title="Details" showBackButton onBackPress={handleBack} />
        <EmptyState
          icon="alert-circle-outline"
          title="Record Not Found"
          message="This inspection record could not be found in the current session."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader 
        title="Inspection Details" 
        showBackButton 
        onBackPress={handleBack} 
        showGroupCode={false} // Shown inside the summary instead
      />

      <ScrollView 
        style={styles.flex} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleSection}>
          <Text style={styles.vendorName}>{inspection.vendorAlias}</Text>
          <Text style={styles.stallCode}>{inspection.stallCode}</Text>
        </View>

        {/* Reusable Summary Component displaying all real saved data */}
        <InspectionSummary inspection={inspection} showImage={true} />

        {/* Info Footer */}
        <View style={styles.footer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.footerText}>
            This is a read-only view of the saved inspection.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  titleSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  vendorName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  stallCode: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    gap: 8,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});