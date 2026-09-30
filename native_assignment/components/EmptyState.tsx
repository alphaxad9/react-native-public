import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
}

export default function EmptyState({ icon = 'search-outline', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={48} color={COLORS.textSecondary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, marginTop: 40 },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8, textAlign: 'center' },
  message: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});