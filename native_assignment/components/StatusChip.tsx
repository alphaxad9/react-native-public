import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { MarketStatus } from '../types/market';

const STATUS_COLORS: Record<MarketStatus, { bg: string, text: string }> = {
  'Active': { bg: COLORS.primaryLight, text: COLORS.primary },
  'Pending': { bg: '#FEF3C7', text: COLORS.warning },
  'Inspected': { bg: '#D1FAE5', text: COLORS.success },
  'In Progress': { bg: '#DBEAFE', text: COLORS.info },
};

export default function StatusChip({ status }: { status: MarketStatus }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS['Pending'];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 12, fontWeight: '600' },
});