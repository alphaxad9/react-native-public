import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../../apis/chat/messages/types';

interface ReplyPreviewProps {
  replyingTo: Message | null;
  onCancel: () => void;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({ replyingTo, onCancel }) => {
  if (!replyingTo) return null;

  return (
    <View style={styles.replyContainer}>
      <View style={styles.replyContent}>
        <Text style={styles.replyUsername}>Replying to {replyingTo.creator_username}</Text>
        <Text style={styles.replyText} numberOfLines={1}>{replyingTo.content}</Text>
      </View>
      <TouchableOpacity onPress={onCancel} style={styles.replyClose}>
        <Ionicons name="close-circle" size={24} color="#666666" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  replyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#ffffff',
  },
  replyContent: { flex: 1, marginLeft: 10 },
  replyUsername: { fontSize: 12, color: '#ffffff', fontWeight: '600', marginBottom: 2 },
  replyText: { fontSize: 13, color: '#aaaaaa' },
  replyClose: { padding: 4 },
});