// src/screens/search_screens/components/UserSearchItem.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserSearchResult } from '../../../apis/search/types';

interface Props {
  user: UserSearchResult;
  onPress?: () => void;
}

export const UserSearchItem: React.FC<Props> = ({ user, onPress }) => {
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  const getFullName = () => {
    if (user.first_name && user.last_name) return `${user.first_name} ${user.last_name}`;
    if (user.first_name) return user.first_name;
    return user.username;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials()}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.username}>{user.username}</Text>
        <Text style={styles.fullName} numberOfLines={1}>{getFullName()}</Text>
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007aff',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },
  fullName: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
});