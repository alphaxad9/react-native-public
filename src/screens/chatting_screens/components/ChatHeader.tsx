import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatHeaderProps {
  navigation: any;
  roomName: string;
  roomType: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ navigation, roomName, roomType }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#ffffff" />
      </TouchableOpacity>
      <View style={styles.headerInfo}>
        <Text style={styles.headerTitle}>{roomName}</Text>
        <Text style={styles.headerSubtitle}>
          {roomType === 'private' ? 'Private Chat' : 'Group Chat'}
        </Text>
      </View>
      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: { padding: 4 },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#ffffff' },
  headerSubtitle: { fontSize: 12, color: '#666666', marginTop: 2 },
  menuButton: { padding: 4 },
});