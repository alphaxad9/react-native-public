import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Inspection } from '../types/inspection';
import { COLORS } from '../constants/colors';

interface RecordCardProps {
  inspection: Inspection;
  onPress: () => void;
}

export default function RecordCard({ inspection, onPress }: RecordCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {inspection.imageUri ? (
          <Image source={{ uri: inspection.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={24} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.vendor}>{inspection.vendorAlias}</Text>
        <Text style={styles.stall}>{inspection.stallCode} • {inspection.category}</Text>
        <View style={styles.footer}>
          <Text style={styles.risk}>Risk: {inspection.riskLevel}</Text>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{inspection.timestamp.split(', ')[1] || inspection.timestamp}</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' },
  imageContainer: { width: 80, height: 80, backgroundColor: COLORS.background },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, padding: 12, justifyContent: 'center' },
  vendor: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  stall: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  risk: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
  timeContainer: { flexDirection: 'row', alignItems: 'center' },
  time: { fontSize: 12, color: COLORS.textSecondary, marginRight: 4 },
});