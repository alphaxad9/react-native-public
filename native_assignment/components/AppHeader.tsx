// native_assignment/components/AppHeader.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { GROUP_CONFIG } from '../constants/groupConfig';

interface AppHeaderProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showGroupCode?: boolean;
}

export default function AppHeader({ title, showBackButton, onBackPress, showGroupCode = true }: AppHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {showBackButton ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
        ) : (
          <Ionicons name="shield-checkmark" size={28} color={COLORS.primary} />
        )}
        <Text style={styles.title}>{title}</Text>
        <View style={styles.spacer} />
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20, 
    paddingTop: 10, 
    paddingBottom: 15, 
    backgroundColor: COLORS.surface, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border 
  },
  topRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  backBtn: { padding: 4 },
  title: { 
    fontSize: 20, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    flex: 1, 
    textAlign: 'center' 
  },
  spacer: { width: 24 },
  groupCode: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: COLORS.primary, 
    textAlign: 'center', 
    marginTop: 4, 
    letterSpacing: 0.5 
  },
});