// native_assignment/components/MarketCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketZone } from '../types/market';
import StatusChip from './StatusChip';
import PriorityBadge from './PriorityBadge';
import { COLORS } from '../constants/colors';

interface MarketCardProps {
  zone: MarketZone;
  onPress?: () => void;
}

export default function MarketCard({ zone, onPress }: MarketCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {zone.image ? (
          <Image source={zone.image} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="storefront-outline" size={32} color={COLORS.textSecondary} />
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <Text style={styles.name}>{zone.name}</Text>
        <Text style={styles.category}>{zone.category}</Text>
        
        <View style={styles.footer}>
          <View style={styles.badges}>
            <StatusChip status={zone.status} />
            <PriorityBadge priority={zone.priority} />
          </View>
          {/* Visual cue that this card is clickable */}
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </View>
      </View>
    </View>
  );

  // If an onPress handler is provided, wrap the content in a TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ flex: 1 }}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: { 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    marginBottom: 16, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: COLORS.border 
  },
  imageContainer: { 
    height: 120, 
    backgroundColor: COLORS.background 
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },
  placeholder: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: COLORS.primaryLight 
  },
  content: { 
    padding: 16 
  },
  name: { 
    fontSize: 16, 
    fontWeight: '700', 
    color: COLORS.textPrimary, 
    marginBottom: 4 
  },
  category: { 
    fontSize: 14, 
    color: COLORS.textSecondary, 
    marginBottom: 12 
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  }
});