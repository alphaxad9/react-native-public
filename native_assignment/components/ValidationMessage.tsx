import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function ValidationMessage({ message }: { message?: string }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  error: { color: COLORS.error, fontSize: 13, marginTop: 6, fontWeight: '500' },
});