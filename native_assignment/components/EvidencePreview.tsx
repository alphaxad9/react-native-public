import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface EvidencePreviewProps {
  imageUri: string | null;
}

export default function EvidencePreview({ imageUri }: EvidencePreviewProps) {
  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <Ionicons name="camera-outline" size={48} color={COLORS.textSecondary} />
          <Text style={styles.placeholderText}>No image selected</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', aspectRatio: 1.2, borderRadius: 16, overflow: 'hidden', marginBottom: 20, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.background },
  image: { width: '100%', height: '100%' },
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { marginTop: 12, fontSize: 14, color: COLORS.textSecondary },
});