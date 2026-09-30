import React, { useRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  PanResponder,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../../apis/chat/messages/types';
import { useGetMessagePicture } from '../../apis/chat/messages/hooks';

interface MessageBubbleProps {
  item: Message;
  onReply: (msg: Message) => void;
}

export const MessageBubble = React.memo(({ item, onReply }: MessageBubbleProps) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);
  
  // States for lazy loading the image when the user clicks download
  const [isFetchingPicture, setIsFetchingPicture] = useState(false);
  const [fetchedImageUrl, setFetchedImageUrl] = useState<string | null>(null);
  
  // States for tracking image download progress
  const [imageLoading, setImageLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gs) => {
      if (item.is_mine) return gs.dx < -15 && Math.abs(gs.dy) < 15;
      return gs.dx > 15 && Math.abs(gs.dy) < 15;
    },
    onPanResponderMove: Animated.event([null, { dx: pan }], { useNativeDriver: false }),
    onPanResponderRelease: (_, gs) => {
      if (item.is_mine && gs.dx < -80) {
        onReply(item);
      } else if (!item.is_mine && gs.dx > 80) {
        onReply(item);
      }
      Animated.spring(pan, { toValue: 0, useNativeDriver: false, friction: 7, tension: 40 }).start();
    },
  }), [item, onReply, pan]);

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

  const hasMedia = item.has_media || item.has_image || !!item.message_picture;
  const initialImageUrl = item.message_picture?.url;
  const needsDownload = hasMedia && !initialImageUrl;

  const { data: pictureData, isLoading: isDownloading } = useGetMessagePicture(
    isFetchingPicture ? item.message_id : ''
  );

  useEffect(() => {
    if (pictureData?.url) {
      setFetchedImageUrl(pictureData.url);
      setIsFetchingPicture(false);
    }
  }, [pictureData]);

  const handleDownloadPress = () => {
    if (!isFetchingPicture && !fetchedImageUrl) {
      setIsFetchingPicture(true);
    }
  };

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

  const renderMedia = () => {
    if (!hasMedia) return null;

    const displayUrl = initialImageUrl || fetchedImageUrl;

    // Case 1: Image URL is available (initial or fetched)
    if (displayUrl) {
      return (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: displayUrl }}
            style={styles.messageImage}
            resizeMode="cover"
            onLoadStart={() => {
              setImageLoading(true);
              setProgress(0);
            }}
            onProgress={(e) => {
              if (e.nativeEvent.total > 0) {
                setProgress(e.nativeEvent.loaded / e.nativeEvent.total);
              }
            }}
            onLoadEnd={() => {
              setImageLoading(false);
              setProgress(1);
            }}
            onError={() => {
              setImageLoading(false);
              setImageError(true);
            }}
          />
          
          {/* Loading Overlay with Filling Circle */}
          {imageLoading && (
            <View style={styles.imageLoadingOverlay}>
              <View style={[styles.progressCircleBorder, getProgressBorderStyle(progress)]}>
                <ActivityIndicator size="small" color="#007aff" style={styles.innerSpinner} />
                <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
              </View>
            </View>
          )}

          {imageError && (
            <View style={styles.imageErrorContainer}>
              <Ionicons name="image-outline" size={40} color="#666666" />
              <Text style={styles.imageErrorText}>Failed to load image</Text>
            </View>
          )}
        </View>
      );
    }

    // Case 2: Media exists but needs to be downloaded (receiver case)
    if (needsDownload) {
      return (
        <TouchableOpacity 
          style={styles.downloadContainer}
          onPress={handleDownloadPress}
          disabled={isFetchingPicture || isDownloading}
        >
          {isFetchingPicture || isDownloading ? (
            // Show a spinning circle while fetching the URL
            <View style={[styles.progressCircleBorder, { borderColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <ActivityIndicator size="small" color="#007aff" style={styles.innerSpinner} />
              <Text style={styles.progressText}>...</Text>
            </View>
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={48} color="#007aff" />
              <Text style={styles.downloadText}>Tap to download</Text>
            </>
          )}
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <Animated.View 
      style={[
        styles.messageRow,
        { justifyContent: item.is_mine ? 'flex-end' : 'flex-start' },
        { transform: [{ translateX: pan }] }
      ]}
      {...panResponder.panHandlers}
    >
      {!item.is_mine && (
        <Animated.View style={[
          styles.swipeReplyIndicator,
          { 
            opacity: pan.interpolate({
              inputRange: [0, 80],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }),
          }
        ]}>
          <Ionicons name="return-up-back" size={24} color="#ffffff" />
        </Animated.View>
      )}

      <View style={[
        styles.messageBubble,
        item.is_mine ? styles.myMessage : styles.otherMessage,
        hasMedia && styles.messageBubbleWithMedia
      ]}>
        {!item.is_mine && (
          <Text style={styles.senderName}>{item.creator_username}</Text>
        )}
        
        {renderMedia()}
        
        {item.content && item.content.trim() !== '' && (
          <Text style={[
            styles.messageText,
            item.is_mine ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        )}
        
        <Text style={[
          styles.messageTime,
          item.is_mine ? styles.myMessageTime : styles.otherMessageTime
        ]}>
          {formatTime(item.created_at)}
        </Text>
      </View>

      {item.is_mine && (
        <Animated.View style={[
          styles.swipeReplyIndicator,
          { 
            opacity: pan.interpolate({
              inputRange: [-80, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }),
          }
        ]}>
          <Ionicons name="return-up-forward" size={24} color="#ffffff" />
        </Animated.View>
      )}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
  },
  swipeReplyIndicator: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageBubbleWithMedia: {
    paddingHorizontal: 4,
    paddingVertical: 4,
    overflow: 'hidden',
  },
  myMessage: {
    backgroundColor: '#ffffff', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#1c1c1e', 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    color: '#007aff',
    marginBottom: 4,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  messageText: { 
    fontSize: 15, 
    lineHeight: 20,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  myMessageText: { color: '#000000' },
  otherMessageText: { color: '#ffffff' },
  messageTime: { 
    fontSize: 10, 
    marginTop: 6, 
    alignSelf: 'flex-end',
    paddingHorizontal: 10,
    paddingBottom: 4,
  },
  myMessageTime: { color: '#666666' },
  otherMessageTime: { color: '#888888' },
  
  // Image & Progress styles
  imageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
  },
  imageLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  progressCircleBorder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  innerSpinner: {
    position: 'absolute',
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    zIndex: 2,
  },
  imageErrorContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  imageErrorText: {
    color: '#ffffff',
    fontSize: 12,
    marginTop: 8,
  },
  
  // Download icon styles
  downloadContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#2c2c2e',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadText: {
    color: '#ffffff',
    fontSize: 14,
    marginTop: 8,
  },
});