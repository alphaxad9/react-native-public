import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../constants/colors';
import { RiskLevel } from '../types/inspection';
import ValidationMessage from './ValidationMessage';

const RISK_COLORS: Record<RiskLevel, { bg: string, text: string, border: string }> = {
  Low: { bg: '#DBEAFE', text: COLORS.info, border: COLORS.info },
  Medium: { bg: '#FEF3C7', text: COLORS.warning, border: COLORS.warning },
  High: { bg: '#FEE2E2', text: COLORS.error, border: COLORS.error },
};

interface RiskSelectorProps {
  selected: RiskLevel | null;
  onSelect: (level: RiskLevel) => void;
  error?: string;
}

export default function RiskSelector({ selected, onSelect, error }: RiskSelectorProps) {
  const levels: RiskLevel[] = ['Low', 'Medium', 'High'];
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Risk Level</Text>
      <View style={styles.segmented}>
        {levels.map((level) => {
          const isSelected = selected === level;
          const colors = RISK_COLORS[level];
          return (
            <TouchableOpacity
              key={level}
              style={[styles.segment, isSelected && { backgroundColor: colors.bg, borderColor: colors.border }]}
              onPress={() => onSelect(level)}
            >
              <Text style={[styles.segmentText, isSelected && { color: colors.text }]}>
                {level}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <ValidationMessage message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  segmented: { flexDirection: 'row', gap: 10 },
  segment: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface },
  segmentText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
});