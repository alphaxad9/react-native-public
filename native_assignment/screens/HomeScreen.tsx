// native_assignment/screens/HomeScreen.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import AppHeader from '../components/AppHeader';
import MarketCard from '../components/MarketCard';
import EmptyState from '../components/EmptyState';
import { MOCK_MARKET_ZONES } from '../data/marketZones';
import { COLORS } from '../constants/colors';
import { MainTabParamList } from '../types/navigation';

// Properly type the navigation for a screen inside a Bottom Tab Navigator
type HomeScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter zones based on search query (Demonstrates Empty State)
  const filteredZones = MOCK_MARKET_ZONES.filter(zone =>
    zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    zone.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleZonePress = (zoneName: string) => {
    console.log(`Navigating from zone: ${zoneName}`); // Debug log to verify click
    // Navigate to the New Inspection tab
    navigation.navigate('NewInspection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader title="Market Catalog" />
      
      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search zones or categories..."
            placeholderTextColor={COLORS.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} onPress={() => setSearchQuery('')} />
          )}
        </View>

        <Text style={styles.sectionTitle}>Assigned Market Zones</Text>

        {filteredZones.length > 0 ? (
          <FlatList
            data={filteredZones}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MarketCard 
                zone={item} 
                onPress={() => handleZonePress(item.name)} 
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState 
            icon="search-outline" 
            title="No zones found" 
            message="Try a different search term or clear your filters." 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, padding: 20 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 16, color: COLORS.textPrimary },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  listContent: { paddingBottom: 20 },
});