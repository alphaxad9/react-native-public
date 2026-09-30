import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  Image,
  Text, // Added missing Text import
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import { Message } from '../../apis/chat/messages/types';
import { ReplyPreview } from './components/ReplyPreview'; 

// Import the React Query hooks
import { useCreateMessage, useMarkMessageAsSent, useUpdateMessage } from '../../apis/chat/messages/hooks'; 

// NEW: Import the WebSocket singleton
import { chatSocket } from '../../websocket/chatSocket';

export interface ChatInputRef {
  handleReply: (msg: Message) => void;
}

interface ChatInputProps {
  roomId: string;
  roomType: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  flatListRef: React.RefObject<FlatList | null>; 
  initialDraft?: Message | null;
}

// Helper to convert local image URI to a Blob for the mutation API
const getFileBlob = async (uri: string): Promise<Blob | any> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  } catch (error) {
    // Fallback for React Native environments where fetch doesn't support local file:// URIs natively.
    // React Native's FormData natively accepts this object structure as a file upload.
    console.warn('Failed to fetch blob, using URI object directly', error);
    return {
      uri,
      name: uri.split('/').pop() || 'image.jpg',
      type: 'image/jpeg',
    };
  }
};

export const ChatInput = forwardRef<ChatInputRef, ChatInputProps>(
  ({ roomId, roomType, setMessages, flatListRef, initialDraft }, ref) => {
    const [messageText, setMessageText] = useState('');
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [draftMessageId, setDraftMessageId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const inputRef = useRef<TextInput>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    // NEW: Ref to debounce typing.start events
    const typingSentRef = useRef(false);

    const createMessageMutation = useCreateMessage(roomId);
    const updateMessageMutation = useUpdateMessage();
    const markAsSentMutation = useMarkMessageAsSent();

    // Load initial draft into the input when the component mounts
    useEffect(() => {
      if (initialDraft) {
        setMessageText(initialDraft.content);
        setDraftMessageId(initialDraft.message_id);
      }
    }, [initialDraft]);
    
    // Auto-save draft whenever user types (with debounce)
    useEffect(() => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      if (!messageText.trim()) {
        return;
      }
      
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          if (draftMessageId) {
            await updateMessageMutation.mutateAsync({
              messageId: draftMessageId,
              new_content: messageText.trim(),
            });
          } else {
            const res = await createMessageMutation.mutateAsync({
              content: messageText.trim(),
              room_type: roomType,
              parent_id: replyingTo?.message_id || undefined,
            });
            
            if (res?.message?.message_id) {
              setDraftMessageId(res.message.message_id);
            }
          }
        } catch (error) {
          console.error('Failed to save draft:', error);
        }
      }, 1000);
      
      return () => {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
      };
    }, [messageText, draftMessageId, roomType, replyingTo]);

    // Upload progress simulation
    useEffect(() => {
      let interval: ReturnType<typeof setInterval> | null = null;
      
      if (isSending) {
        setUploadProgress(0);
        interval = setInterval(() => {
          setUploadProgress((prev) => {
            if (prev >= 0.95) return 0.95; // Cap at 95% until it actually finishes
            // Increment faster at the beginning, slower as it approaches 95%
            return prev + (0.95 - prev) * 0.05 + 0.01; 
          });
        }, 200);
      } else if (uploadProgress > 0 && uploadProgress < 1) {
        // When sending finishes, jump to 100%
        setUploadProgress(1);
        const timeout = setTimeout(() => {
          setUploadProgress(0);
        }, 500); // Show 100% for half a second
        return () => clearTimeout(timeout);
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isSending]);

    // Helper to get the border color based on progress (simulates a filling circle)
    const getProgressBorderStyle = (prog: number) => {
      const activeColor = '#007aff';
      const inactiveColor = 'rgba(255, 255, 255, 0.2)';
      return {
        borderTopColor: prog > 0.01 ? activeColor : inactiveColor,
        borderRightColor: prog > 0.25 ? activeColor : inactiveColor,
        borderBottomColor: prog > 0.5 ? activeColor : inactiveColor,
        borderLeftColor: prog > 0.75 ? activeColor : inactiveColor,
      };
    };

    // NEW: Handle text change with typing indicator logic
    const handleTextChange = useCallback((text: string) => {
      setMessageText(text);

      // Send typing.start (debounced so we don't spam the server)
      if (text.length > 0 && !typingSentRef.current) {
        typingSentRef.current = true;
        console.log('⌨️ Sending typing.start');
        chatSocket.send({ type: 'typing.start' });

        // Reset the flag after 2 seconds so it can send again if they keep typing
        setTimeout(() => {
          typingSentRef.current = false;
        }, 2000);
      }

      // If they delete all text, send typing.stop immediately
      if (text.length === 0) {
        typingSentRef.current = false;
        console.log('⌨️ Sending typing.stop (text cleared)');
        chatSocket.send({ type: 'typing.stop' });
      }
    }, []);

    const handlePickImage = async () => {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required!');
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0]);
      }
    };

    const handleSendMessage = useCallback(async () => {
      // Updated validation to allow sending if there is an image even without text
      if ((!messageText.trim() && !selectedImage) || isSending) return;
      
      // NEW: Stop typing indicator immediately when sending a message
      typingSentRef.current = false;
      chatSocket.send({ type: 'typing.stop' });

      // Clear any pending auto-save draft timeout to prevent race conditions
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      setIsSending(true);
      
      try {
        let fileBlob: Blob | any = undefined;
        if (selectedImage) {
          fileBlob = await getFileBlob(selectedImage.uri);
        }

        // If we have an image, we MUST create a new message via `createMessageMutation` 
        // because our current update draft mutation doesn't support file attachments.
        if (draftMessageId && !selectedImage) {
          // 1. First, update the draft with the latest text on the server
          await updateMessageMutation.mutateAsync({
            messageId: draftMessageId,
            new_content: messageText.trim(),
          });

          // 2. Then, mark the updated draft as sent
          const response = await markAsSentMutation.mutateAsync({ 
            messageId: draftMessageId 
          });
          
          if (response?.message) {
            // FIX: Explicitly set is_mine to true so it aligns to the right
            setMessages(prev => [...prev, { 
              ...response.message, 
              is_mine: true, 
              creator_username: response.message.creator_username || 'You' 
            }]);
          }
        } else {
          const createResponse = await createMessageMutation.mutateAsync({
            content: messageText.trim(),
            room_type: roomType,
            parent_id: replyingTo?.message_id || undefined,
            file: fileBlob as File | Blob, // Cast handles React Native FormData fallback
          });
          
          const newMessage = createResponse.message;
          const sentResponse = await markAsSentMutation.mutateAsync({ 
            messageId: newMessage.message_id 
          });
          
          if (sentResponse?.message) {
            // FIX: Explicitly set is_mine to true so it aligns to the right
            setMessages(prev => [...prev, { 
              ...sentResponse.message, 
              is_mine: true, 
              creator_username: sentResponse.message.creator_username || 'You' 
            }]);
          } else {
            setMessages(prev => [...prev, { 
              ...newMessage, 
              status: 'sent', 
              is_mine: true, 
              creator_username: newMessage.creator_username || 'You' 
            }]);
          }
        }
        
        setMessageText('');
        setDraftMessageId(null);
        setReplyingTo(null);
        setSelectedImage(null); // Clear selected image
        
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } catch (error) {
        console.error('Send message error:', error);
        Alert.alert('Error', 'Failed to send message. Please try again.');
        // Reset progress immediately on error so it doesn't show 100%
        setUploadProgress(0);
      } finally {
        setIsSending(false);
      }
    }, [
      messageText, 
      draftMessageId,
      roomType, 
      replyingTo, 
      isSending, 
      setMessages, 
      flatListRef, 
      createMessageMutation, 
      markAsSentMutation,
      updateMessageMutation,
      selectedImage // Added dependency
    ]);

    const handleReply = useCallback((msg: Message) => {
      setReplyingTo(msg);
      inputRef.current?.focus();
    }, []);

    useImperativeHandle(ref, () => ({
      handleReply,
    }));

    return (
      <>
        <ReplyPreview 
          replyingTo={replyingTo}
          onCancel={() => setReplyingTo(null)}
        />

        {/* Image Preview UI */}
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <View style={styles.imagePreviewWrapper}>
              <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
              
              {/* Upload Progress Overlay */}
              {uploadProgress > 0 && uploadProgress < 1 && (
                <View style={styles.uploadProgressOverlay}>
                  <View style={[styles.progressCircleBorder, getProgressBorderStyle(uploadProgress)]}>
                    <ActivityIndicator size="small" color="#007aff" style={styles.innerSpinner} />
                    <Text style={styles.progressText}>{Math.round(uploadProgress * 100)}%</Text>
                  </View>
                </View>
              )}
              
              {/* Success Overlay */}
              {uploadProgress === 1 && (
                <View style={styles.uploadProgressOverlay}>
                  <View style={styles.successCircle}>
                    <Ionicons name="checkmark" size={32} color="#ffffff" />
                  </View>
                </View>
              )}

              {/* Remove button (hide while uploading) */}
              {uploadProgress === 0 && (
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#ffffff" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        <View style={styles.inputContainer}>
          {/* Hooked the attach button to trigger image selection */}
          <TouchableOpacity style={styles.attachButton} onPress={handlePickImage}>
            <Ionicons name="attach" size={24} color="#666666" />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#666666"
              value={messageText}
              onChangeText={handleTextChange} // CHANGED: Use the new handler
              multiline
              textAlignVertical="center"
            />
          </View>
          <TouchableOpacity 
            style={[
              styles.sendButton,
              (!messageText.trim() && !selectedImage || isSending) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={(!messageText.trim() && !selectedImage) || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Ionicons 
                name="send" 
                size={20} 
                color={(messageText.trim() || selectedImage) ? '#000000' : '#666666'} 
              />
            )}
          </TouchableOpacity>
        </View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  attachButton: { padding: 8 },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: '#1c1c1e',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 20,
  },
  sendButtonDisabled: {
    backgroundColor: '#1c1c1e',
  },
  imagePreviewContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  imagePreviewWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    zIndex: 10,
  },
  // Upload progress styles
  uploadProgressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 5,
  },
  progressCircleBorder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  innerSpinner: {
    position: 'absolute',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    zIndex: 2,
  },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34c759', // Green color for success
    justifyContent: 'center',
    alignItems: 'center',
  },
});