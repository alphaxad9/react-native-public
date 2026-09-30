import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import ValidationMessage from './ValidationMessage';

interface ConsentCheckboxProps {
  checked: boolean;
  onToggle: () => void;
  error?: string;
}

export default function ConsentCheckbox({ checked, onToggle, error }: ConsentCheckboxProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
        </View>
        <Text style={styles.text}>
          I confirm that the vendor has given consent for this inspection.
        </Text>
      </TouchableOpacity>
      <ValidationMessage message={error} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2 },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  text: { flex: 1, fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
});