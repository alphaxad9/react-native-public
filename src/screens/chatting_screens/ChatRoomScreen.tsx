import React, { useEffect, useCallback, useRef, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ListRenderItemInfo,
  Text,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { useGetMessages } from '../../apis/chat/messages/hooks';
import { Message, MessagesResponse } from '../../apis/chat/messages/types';
import { MessageBubble } from './MessageBubble';
import { ChatHeader } from './components/ChatHeader';
import { ChatInput, ChatInputRef } from './ChatInput';
import { useChatSocket } from '../../websocket/useChatSocket';
import { WebSocketEvent } from '../../websocket/types';

export const ChatRoomScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const { roomId, roomName, roomType } = route.params;
  const queryClient = useQueryClient();
  
  // Typing indicator state
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  // Use the React Query hook instead of direct API call
  // HTTP loads history (Initial room load)
  const { data, isLoading } = useGetMessages(roomId);
  const messages = data?.messages || [];

  // Mimic setMessages to update the React Query cache instead of local state.
  // This ensures ChatInput continues to work exactly as before without modifying its implementation.
  const setMessages = useCallback((updater: React.SetStateAction<Message[]>) => {
    queryClient.setQueryData(['messages', roomId, undefined, undefined], (oldData: MessagesResponse | undefined) => {
      if (!oldData) return oldData;
      const newMessages = typeof updater === 'function' 
        ? (updater as (prev: Message[]) => Message[])(oldData.messages) 
        : updater;
      return { ...oldData, messages: newMessages };
    });
  }, [roomId, queryClient]);

  // ── WebSocket Integration ────────────────────────────────────────────────
  // WebSocket loads new events. 
  // Handle incoming WebSocket events and update the React Query cache directly.
  const handleWebSocketMessage = useCallback((event: WebSocketEvent) => {
    if (event.event === 'message_sent') {
      queryClient.setQueryData(
        ['messages', roomId, undefined, undefined],
        (oldData: MessagesResponse | undefined) => {
          if (!oldData) return oldData;

          // Step 7: Prevent duplicate messages.
          // If the user sent this message, the HTTP POST already added it to the cache.
          // When the WebSocket broadcasts it back, we ignore it to prevent duplicates.
          const exists = oldData.messages.some(
            (m) => m.message_id === event.message.message_id
          );
          if (exists) return oldData;

          // Map WebSocket payload to the Message type expected by the UI.
          // Check if message has media and if message_picture is available
          const hasMedia = event.message.content === '' || event.message.content === null ? 
            !!(event.message as any).message_picture : false;
          
          const messagePicture = (event.message as any).message_picture;
          
          // Map WebSocket payload to the Message type expected by the UI.
          const newMessage = {
            ...event.message,
            content: event.message.content || '',
            has_media: hasMedia,
            has_image: hasMedia,
            is_mine: false, // If it's coming from WS and wasn't in cache, it's from someone else
            creator_username: 'User', // Fallback since gateway doesn't send username in WS payload
            // Include message_picture if available, otherwise mark media as needing download
            message_picture: messagePicture || null,
            media_download_required: hasMedia && !messagePicture, // Flag for download icon
          } as unknown as Message;

          return {
            ...oldData,
            messages: [...oldData.messages, newMessage],
            total_count: oldData.total_count + 1,
          };
        }
      );
    } else if (event.event === 'typing_started') {
      // TODO: Replace with actual current user ID from your auth state
      const currentUserId = 'current-user-id'; 
      
      // Ignore your own typing events
      if (event.user_id === currentUserId) {
        return;
      }

      // Add typing user
      setTypingUsers(prev => {
        if (prev.includes(event.user_id)) {
          return prev;
        }
        return [...prev, event.user_id];
      });

      // Auto remove after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== event.user_id));
      }, 3000);
    }
  }, [roomId, queryClient]);

  // Connect the WebSocket when the screen mounts and disconnect on unmount
  // We use the useChatSocket hook to manage the connection lifecycle cleanly.
  useChatSocket(roomId, handleWebSocketMessage);

  const flatListRef = useRef<FlatList>(null);
  const chatInputRef = useRef<ChatInputRef>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Trigger reply via the ChatInput ref
  const handleReply = useCallback((msg: Message) => {
    chatInputRef.current?.handleReply(msg);
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Message>) => (
    <MessageBubble item={item} onReply={handleReply} />
  ), [handleReply]);

  const keyExtractor = useCallback((item: Message) => item.message_id, []);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { 
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ChatHeader 
        navigation={navigation}
        roomName={roomName}
        roomType={roomType}
      />

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
        />

        {/* Typing Indicator UI */}
        {typingUsers.length > 0 && (
          <View style={styles.typingIndicatorContainer}>
            <Text style={styles.typingIndicatorText}>
              {typingUsers[0]} is typing...
            </Text>
          </View>
        )}

        {/* The fully isolated Input Component */}
        <ChatInput 
          ref={chatInputRef}
          roomId={roomId}
          roomType={roomType}
          setMessages={setMessages}
          flatListRef={flatListRef}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardView: { flex: 1 },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typingIndicatorContainer: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  typingIndicatorText: {
    color: '#999',
    fontSize: 12,
  },
});