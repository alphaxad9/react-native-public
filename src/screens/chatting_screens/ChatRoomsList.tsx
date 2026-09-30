// src/screens/chatting_screens/ChatRoomsList.tsx
import React, { useCallback, useEffect } from 'react'; // <-- Added useEffect
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useGetHomeRoomsInfinite } from '../../apis/chat/chat_rooms/hooks';
import { ChatRoom } from '../../apis/chat/chat_rooms/types';
import { useInboxSocket } from '../../websocket/inbox_websocket/useInboxSocket';
import { InboxWebSocketEvent } from '../../websocket/inbox_websocket/inboxTypes';

const ChatRoomItem = ({ room, onPress }: { room: ChatRoom; onPress: () => void }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.roomItem} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{getInitials(room.room_name)}</Text>
        {room.room_type === 'private' && (
          <View style={styles.privateBadge}>
            <Ionicons name="person" size={8} color="#ffffff" />
          </View>
        )}
      </View>
      
      <View style={styles.roomInfo}>
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>
            {room.room_name}
            {room.is_pinned && (
              <Ionicons name="pin" size={14} color="#007aff" style={styles.pinIcon} />
            )}
          </Text>
          {room.last_action_at && (
            <Text style={styles.timestamp}>{formatTime(room.last_action_at)}</Text>
          )}
        </View>
        
        <View style={styles.messagePreview}>
          {room.last_message && (
            <>
              {!room.last_message.is_mine && room.room_type === 'group' && (
                <Text style={styles.senderName} numberOfLines={1}>
                  {room.last_message.sender_username}:{' '}
                </Text>
              )}
              <Text style={styles.lastMessage} numberOfLines={1}>
                {room.last_message.has_image ? '📷 Image' : room.last_message.content}
              </Text>
            </>
          )}
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {room.unread_messages_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {room.unread_messages_count > 99 ? '99+' : room.unread_messages_count}
            </Text>
          </View>
        )}
        {room.is_muted && (
          <Ionicons name="notifications-off" size={16} color="#666666" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export const ChatRoomsList = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useGetHomeRoomsInfinite(20);

  const rooms = data?.pages.flatMap(page => page.rooms) ?? [];



  // ── WebSocket Integration ────────────────────────────────────────────────
  const handleRoomUpdated = useCallback((event: InboxWebSocketEvent) => {
    
    if (event.event !== 'room_updated') return;

    const updatedRoomData = event.room;


    queryClient.setQueriesData(
      { queryKey: ['homeRoomsInfinite'] }, 
      (oldData: any) => {
        
        if (!oldData) return oldData;


        let originalRoom: ChatRoom | undefined;
        for (const page of oldData.pages) {
          const found = page.rooms.find((r: ChatRoom) => r.room_id === updatedRoomData.room_id);
          if (found) {
            originalRoom = found;
            break;
          }
        }

        if (!originalRoom) {
          // We just return oldData here. The background refetch below will handle fetching the new room.
          return oldData; 
        }

        const updatedRoom: ChatRoom = {
          ...originalRoom,
          last_action_at: updatedRoomData.last_activity_at,
          last_message: {
            ...(originalRoom.last_message || {}), 
            content: updatedRoomData.last_message,
            sender_username: updatedRoomData.sender_username,
          } as any, 
        };

        const pagesWithoutRoom = oldData.pages.map((page: any) => ({
          ...page,
          rooms: page.rooms.filter((r: ChatRoom) => r.room_id !== updatedRoomData.room_id),
        }));

        const firstPage = pagesWithoutRoom[0];
        
        let insertIndex = 0;
        if (!updatedRoom.is_pinned) {
          insertIndex = firstPage.rooms.findIndex((r: ChatRoom) => !r.is_pinned);
          if (insertIndex === -1) insertIndex = firstPage.rooms.length;
        }

        const newFirstPageRooms = [
          ...firstPage.rooms.slice(0, insertIndex),
          updatedRoom,
          ...firstPage.rooms.slice(insertIndex),
        ];

        pagesWithoutRoom[0] = { ...firstPage, rooms: newFirstPageRooms };

        const result = {
          ...oldData,
          pages: pagesWithoutRoom,
        };


        return result;
      }
    );

    // ── FIX FOR PAGINATION INCONSISTENCY (OPTION 2) ─────────────────────────
    // We just did an optimistic update (moved a room from Page 2 to Page 1).
    // This makes Page 1 larger and Page 2 smaller.
    // To prevent this from breaking pagination over time, we immediately 
    // trigger a background refetch. The UI already updated instantly, 
    // and this refetch will silently correct the page sizes from the server.
    queryClient.invalidateQueries({ queryKey: ['homeRoomsInfinite'] });
    // ────────────────────────────────────────────────────────────────────────

  }, [queryClient]);

  useInboxSocket(handleRoomUpdated);

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleRoomPress = (room: ChatRoom) => {
    navigation.navigate('ChatRoom', {
      roomId: room.room_id,
      roomName: room.room_name,
      roomType: room.room_type,
    });
  };

  const renderItem = ({ item }: { item: ChatRoom }) => (
    <ChatRoomItem room={item} onPress={() => handleRoomPress(item)} />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007aff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Ionicons name="create-outline" size={24} color="#007aff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={(item) => item.room_id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#007aff"
            colors={['#007aff']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="#333333" />
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>
              Start a conversation with your friends!
            </Text>
          </View>
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#007aff" />
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  newChatButton: {
    padding: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  roomItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#0a0a0a',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007aff',
  },
  privateBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007aff',
    borderRadius: 10,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  roomInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  pinIcon: {
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#666666',
    marginLeft: 8,
  },
  messagePreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 13,
    color: '#007aff',
    fontWeight: '500',
  },
  lastMessage: {
    fontSize: 13,
    color: '#888888',
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 4,
  },
  unreadBadge: {
    backgroundColor: '#007aff',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});