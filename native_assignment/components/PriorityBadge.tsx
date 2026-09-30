import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { MarketPriority } from '../types/market';

const PRIORITY_COLORS: Record<MarketPriority, string> = {
  'High': COLORS.error,
  'Medium': COLORS.warning,
  'Low': COLORS.info,
};

export default function PriorityBadge({ priority }: { priority: MarketPriority }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: PRIORITY_COLORS[priority] }]} />
      <Text style={styles.text}>Priority: {priority}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  text: { fontSize: 12, fontWeight: '500', color: COLORS.textSecondary },
});