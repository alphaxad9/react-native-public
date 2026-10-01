// native_assignment/screens/RecordsScreen.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../types/navigation';
import { COLORS } from '../constants/colors';


// Context & Components
import { useInspections } from '../context/InspectionContext';
import AppHeader from '../components/AppHeader';
import RecordCard from '../components/RecordCard';
import EmptyState from '../components/EmptyState';

// Type the navigation prop for the Records Stack
type NavigationProp = NativeStackNavigationProp<RecordsStackParamList, 'RecordsList'>;

export default function RecordsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { records } = useInspections();

  const handleRecordPress = (inspectionId: string) => {
    // Navigate to the Details screen, passing the ID as a route parameter
    navigation.navigate('InspectionDetails', { inspectionId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Inspection Records" />

      <View style={styles.content}>
        {records.length === 0 ? (
          // Empty State: Shown when no inspections have been saved yet
          <EmptyState
            icon="document-text-outline"
            title="No inspections yet"
            message="Completed inspections will appear here. Start a new inspection to add your first record."
          />
        ) : (
          // Records List: Shown when there is saved data
          <>
            <View style={styles.headerRow}>
              <Text style={styles.countText}>
                {records.length} Record{records.length !== 1 ? 's' : ''} Saved
              </Text>
            </View>
            
            <FlatList
              data={records}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RecordCard 
                  inspection={item} 
                  onPress={() => handleRecordPress(item.id)} 
                />
              )}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
});