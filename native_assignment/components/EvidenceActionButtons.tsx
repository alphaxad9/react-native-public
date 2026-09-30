import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface EvidenceActionButtonsProps {
  hasImage: boolean;
  onTakePhoto: () => void;
  onChooseGallery: () => void;
  onReplace: () => void;
  onRemove: () => void;
}

export default function EvidenceActionButtons({ hasImage, onTakePhoto, onChooseGallery, onReplace, onRemove }: EvidenceActionButtonsProps) {
  return (
    <View style={styles.container}>
      {!hasImage ? (
        <>
          <TouchableOpacity style={[styles.button, styles.primaryBtn]} onPress={onTakePhoto}>
            <Ionicons name="camera" size={20} color="#FFF" />
            <Text style={styles.primaryText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.secondaryBtn]} onPress={onChooseGallery}>
            <Ionicons name="images-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={[styles.button, styles.secondaryBtn]} onPress={onReplace}>
            <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
            <Text style={styles.secondaryText}>Replace Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.dangerBtn]} onPress={onRemove}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.dangerText}>Remove Image</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, marginBottom: 24 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
  primaryBtn: { backgroundColor: COLORS.primary },
  primaryText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  secondaryBtn: { backgroundColor: COLORS.primaryLight, borderWidth: 1, borderColor: COLORS.primary },
  secondaryText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  dangerBtn: { backgroundColor: '#FEE2E2', borderWidth: 1, borderColor: COLORS.error },
  dangerText: { color: COLORS.error, fontSize: 16, fontWeight: '600' },
});