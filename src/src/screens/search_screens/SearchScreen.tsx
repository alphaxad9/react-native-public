// src/screens/search_screens/SearchScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  SectionList,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGlobalSearch, useSmartUserSearch } from '../../../apis/search/hooks';
import { useDebounce } from '../../../apis/search/useDebounce';
import { TagSearchItem } from '../../../screens/search_screens/components/TagSearchItem';
import { TagSearchResult, SmartUserSearchResult } from '../../../apis/search/types';

// --- Smart User Search Item Component ---
// Displays the user along with the social signals used for ranking
const SmartUserSearchItem = ({ user, onPress }: { user: SmartUserSearchResult; onPress: () => void }) => {
  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Determine follow status text and color
  let statusText = '';
  let statusColor = '#666666';
  if (user.follow_status === 'friends') {
    statusText = 'Friends';
    statusColor = '#007aff'; // Blue for friends
  } else if (user.follow_status === 'pending') {
    statusText = 'Following';
    statusColor = '#34c759'; // Green for following
  }

  return (
    <TouchableOpacity style={styles.smartUserItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarText}>{user.username?.charAt(0).toUpperCase() || '?'}</Text>
      </View>
      <View style={styles.smartUserInfo}>
        <Text style={styles.smartUsername}>{user.username}</Text>
        {(user.first_name || user.last_name) && (
          <Text style={styles.smartName}>{user.first_name} {user.last_name}</Text>
        )}
        
        {/* Social Signals (The data used to decide the rank) */}
        <View style={styles.signalsContainer}>
          {statusText ? (
            <Text style={[styles.signalText, { color: statusColor, fontWeight: '600' }]}>
              {statusText}
            </Text>
          ) : null}
          
          {user.mutual_friend_count > 0 && (
            <Text style={styles.signalText}>
              {user.mutual_friend_count} mutual {user.mutual_friend_count === 1 ? 'friend' : 'friends'}
            </Text>
          )}
          
          <Text style={styles.signalText}>
            {formatCount(user.follower_count)} followers
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666666" />
    </TouchableOpacity>
  );
};

export const SearchScreen = () => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  
  // 1. Debounce the query by 400ms
  const debouncedQuery = useDebounce(query, 400);

  // 2. Fetch Tags (and basic users, though we ignore basic users in favor of smart users)
  const { data: globalData, isFetching: isGlobalFetching } = useGlobalSearch(
    { q: debouncedQuery, limit: 5 },
    debouncedQuery.trim().length >= 2
  );

  // 3. Fetch Smart/Ranked Users (No longer needs user_id!)
  const { data: smartData, isFetching: isSmartFetching } = useSmartUserSearch(
    { q: debouncedQuery },
    debouncedQuery.trim().length >= 2
  );

  const isFetching = isGlobalFetching || isSmartFetching;

  // 4. Map the API responses to SectionList format
  const sections = useMemo(() => {
    const result = [];

    // Use Smart Users for the Users section (Ranked by social signals)
    if (smartData && smartData.results.length > 0) {
      result.push({ title: 'Users', data: smartData.results, type: 'smart_user' });
    }
    
    // Use Global Search for the Tags section
    if (globalData && globalData.tags.length > 0) {
      result.push({ title: 'Tags', data: globalData.tags, type: 'tag' });
    }
    
    return result;
  }, [smartData, globalData]);

  const handleUserPress = (user: SmartUserSearchResult) => {
    console.log('Navigate to smart user profile:', user.id);
    // navigation.navigate('UserProfile', { userId: user.id });
  };

  const handleTagPress = (tag: TagSearchResult) => {
    console.log('Navigate to tag page:', tag.name);
    // navigation.navigate('TagPage', { tagName: tag.name });
  };

  const renderSectionHeader = ({ section }: { section: any }) => (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionHeader}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item, section }: { item: any; section: any }) => {
    if (section.type === 'smart_user') {
      return <SmartUserSearchItem user={item} onPress={() => handleUserPress(item)} />;
    }
    if (section.type === 'tag') {
      return <TagSearchItem tag={item} onPress={() => handleTagPress(item)} />;
    }
    return null;
  };

  const keyExtractor = (item: any, index: number) => {
    return item.id || index.toString();
  };

  // 5. Smart Empty States
  const renderEmptyState = () => {
    if (query.trim().length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#333333" />
          <Text style={styles.emptyTitle}>Discover</Text>
          <Text style={styles.emptyText}>
            Search for users, tags, and more...
          </Text>
        </View>
      );
    }

    if (query.trim().length < 2) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Keep typing to search...</Text>
        </View>
      );
    }

    if (isFetching) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007aff" />
        </View>
      );
    }

    // Show "No results" if we have data from the API but the sections array is empty
    if ((smartData || globalData) && sections.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#333333" />
          <Text style={styles.emptyTitle}>No results found</Text>
          <Text style={styles.emptyText}>
            Try searching for something else.
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Search</Text>
      </View>

      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={18} color="#666666" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder="Search users, tags..."
          placeholderTextColor="#666666"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          autoFocus // Standard UX for search screens
        />
        {isFetching && (
          <ActivityIndicator size="small" color="#007aff" style={styles.inputLoader} />
        )}
      </View>

      {/* Results List */}
      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#000000',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#ffffff',
    padding: 0, // Reset default padding
  },
  inputLoader: {
    marginLeft: 8,
  },
  listContent: {
    flexGrow: 1,
  },
  sectionHeaderContainer: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007aff',
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
  // --- Smart User Item Styles ---
  smartUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
  },
  smartUserInfo: {
    flex: 1,
  },
  smartUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  smartName: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  signalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  signalText: {
    fontSize: 12,
    color: '#888888',
    marginRight: 8,
  },
});