// src/screens/search_screens/components/TagSearchItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TagSearchResult } from '../../../apis/search/types';

interface Props {
  tag: TagSearchResult;
  onPress?: () => void;
}

export const TagSearchItem: React.FC<Props> = ({ tag, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Ionicons name="pricetag" size={24} color="#007aff" />
      </View>
      <View style={styles.info}>
        <Text style={styles.tagName}>#{tag.name}</Text>
        <Text style={styles.stats} numberOfLines={1}>
          {tag.usage_count} posts • Trend score: {tag.trend_score.toFixed(1)}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  tagName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  stats: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
});