import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Inspection } from '../types/inspection';
import { COLORS } from '../constants/colors';

interface InspectionSummaryProps {
  inspection: Inspection;
  showImage?: boolean;
}

export default function InspectionSummary({ inspection, showImage = true }: InspectionSummaryProps) {
  return (
    <View style={styles.container}>
      <SummaryRow icon="person-outline" label="Vendor Alias" value={inspection.vendorAlias} />
      <SummaryRow icon="pricetag-outline" label="Stall Code" value={inspection.stallCode} />
      <SummaryRow icon="grid-outline" label="Category" value={inspection.category} />
      <SummaryRow icon="call-outline" label="Contact Number" value={inspection.contactNumber} />
      <SummaryRow icon="alert-circle-outline" label="Risk Level" value={inspection.riskLevel} />
      <SummaryRow icon="checkmark-circle-outline" label="Consent" value={inspection.consent ? 'Confirmed' : 'Not Given'} />
      <SummaryRow icon="time-outline" label="Timestamp" value={inspection.timestamp} />
      <SummaryRow icon="shield-checkmark-outline" label="Group Code" value={inspection.groupVerificationCode} highlight />
      
      {showImage && (
        <View style={styles.imageSection}>
          <Text style={styles.sectionLabel}>Evidence Image</Text>
          {inspection.imageUri ? (
            <Image source={{ uri: inspection.imageUri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={32} color={COLORS.textSecondary} />
              <Text style={styles.noImageText}>No image attached</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function SummaryRow({ icon, label, value, highlight }: { icon: keyof typeof Ionicons.glyphMap, label: string, value: string, highlight?: boolean }) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={highlight ? COLORS.primary : COLORS.textSecondary} style={styles.icon} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: COLORS.surface, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  icon: { width: 24, marginRight: 8 },
  label: { flex: 1, fontSize: 14, color: COLORS.textSecondary },
  value: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'right', flex: 1.5 },
  highlightValue: { color: COLORS.primary },
  imageSection: { marginTop: 20 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 10 },
  image: { width: '100%', aspectRatio: 1.2, borderRadius: 12, backgroundColor: COLORS.background },
  noImage: { width: '100%', aspectRatio: 1.2, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  noImageText: { marginTop: 8, fontSize: 14, color: COLORS.textSecondary },
});