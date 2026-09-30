problem (this is my frontend (ishimwe@alpha:~/projs/django/authentication/1project/my-mobile-frontend$ cd src/
ishimwe@alpha:~/projs/django/authentication/1project/my-mobile-frontend/src$ tree
.
├── apis
│   ├── apis.tsx
│   ├── chat
│   │   ├── chat_rooms
│   │   │   ├── apis.ts
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   └── messages
│   │       ├── apis.ts
│   │       ├── hooks.ts
│   │       └── types.ts
│   ├── client.ts
│   ├── feed
│   │   ├── apis.tsx
│   │   ├── comments
│   │   │   ├── apis.tsx
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   ├── hooks.ts
│   │   ├── likes
│   │   │   ├── apis.tsx
│   │   │   ├── hooks.ts
│   │   │   └── types.ts
│   │   └── types.ts
│   ├── hooks.ts
│   ├── search
│   │   ├── apis.ts
│   │   ├── hooks.ts
│   │   └── types.ts
│   ├── types.ts
│   └── users
│       ├── apis.tsx
│       ├── hooks.ts
│       └── types.ts
├── context
│   └── ThemeContext.tsx
├── hooks
│   └── typedHooks.ts
├── navigation
│   ├── AppNavigator.tsx
│   └── MainTabNavigator.tsx
├── screens
│   ├── chatting_screens
│   │   ├── ChatInput.tsx
│   │   ├── ChatRoomScreen.tsx
│   │   ├── ChatRoomsList.tsx
│   │   ├── components
│   │   │   ├── ChatHeader.tsx
│   │   │   └── ReplyPreview.tsx
│   │   └── MessageBubble.tsx
│   ├── DebugScreen.tsx
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── messages_screens
│   ├── RegisterScreen.tsx
│   └── styles.ts
├── store
│   ├── authSlice.ts
│   └── index.ts
└── websocket
    ├── chatSocket.ts
    ├── inbox_websocket
    │   ├── inboxSocket.ts
    │   ├── inboxTypes.ts
    │   └── useInboxSocket.ts
    ├── presence_websocket
    │   ├── presenceSocket.ts
    │   ├── presenceTypes.ts
    │   └── usePresenceSocket.ts
    ├── types.ts
    └── useChatSocket.ts

20 directories, 51 files
ishimwe@alpha:~/projs/django/authentication/1project/my-mobile-frontend/src$ 
) and i have added the types, api, and hook for my search now give me a full step by step guide of how we will insert in the search page (with production practices like debouncers and others) see it works (himwe@alpha:~/projs/infra/opensearch$ curl -X GET "http://127.0.0.1:8000/open_search_apis/search/global/?q=ish&limit=5" | jq
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   359  100   359    0     0    243      0  0:00:01  0:00:01 --:--:--   243
{
  "users": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "username": "ishimwe",
      "first_name": "Ishimwe",
      "last_name": "Dev",
      "created_at": "2026-06-21T09:25:20.920316+00:00"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "username": "alpha_dev",
      "first_name": "Alpha",
      "last_name": "Ishimwe",
      "created_at": "2026-06-21T09:25:29.291971+00:00"
    }
  ],
  "tags": []
}
ishimwe@alpha:~/projs/infra/opensearch$ 
) see (// src/api/search/hooks.ts

import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { globalSearch } from './apis';
import { GlobalSearchResponse, GlobalSearchParams } from './types';

type ApiError = AxiosError<{
  message?: string;
  error?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}>;

/**
 * Hook to execute a global search.
 * 
 * @param params - The search parameters (q and optional limit).
 * @param enabled - Whether the query should automatically run (useful for debouncing).
 */
export const useGlobalSearch = (
  params: GlobalSearchParams, 
  enabled: boolean = true
) => {
  return useQuery<GlobalSearchResponse, ApiError>({
    queryKey: ['globalSearch', params.q, params.limit],
    queryFn: () => globalSearch(params),
    
    // Only run the query if there is actually a search term
    enabled: enabled && !!params.q.trim(), 
    
    // Search results don't change every second, cache them for 2 minutes
    staleTime: 1000 * 60 * 2, 
    
    // Keep in memory for 5 minutes so navigating back to search is instant
    gcTime: 1000 * 60 * 5, 
    
    // Don't trigger a new search just because the user switched tabs and came back
    refetchOnWindowFocus: false, 
  });
};)(// src/api/search/apis.ts

import { AxiosError } from 'axios';
import { client } from '../client';
import { GlobalSearchResponse, GlobalSearchParams } from './types';

/**
 * Execute a global search across all indices (users, tags, etc.)
 * Uses the backend's OpenSearch _msearch implementation.
 */
export const globalSearch = async (
  params: GlobalSearchParams
): Promise<GlobalSearchResponse> => {
  try {
    const response = await client.get<GlobalSearchResponse>(
      'open_search_apis/search/global/',
      { params } // Axios will automatically convert this to ?q=...&limit=...
    );
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error(
        'Failed to execute global search:',
        error.response?.data || error.message
      );
    }
    throw error;
  }
};)(// src/api/search/types.ts

// --- Search Result Types ---

export interface UserSearchResult {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string; // ISO 8601 date string
}

export interface TagSearchResult {
  id: string;
  name: string;
  usage_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  trend_score: number;
  usage_last_24h: number;
  usage_last_7d: number;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

// The unified response from the Global Search API
export interface GlobalSearchResponse {
  users: UserSearchResult[];
  tags: TagSearchResult[];
  // Later you can easily add: communities: CommunitySearchResult[], posts: PostSearchResult[]
}

// --- Request Types ---

export interface GlobalSearchParams {
  q: string; // The search query
  limit?: number; // Max results per category (default is 5 on the backend)
}) and i have (// src/navigation/AppNavigator.tsx
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { ChatRoomScreen } from '../screens/chatting_screens/ChatRoomScreen';
import { MainTabNavigator } from './MainTabNavigator';
import { useAppSelector, useAppDispatch } from '../hooks/typedHooks';
import { useCheckAuth } from '../apis/hooks';
import { setAuthCheckComplete } from '../store/authSlice';

// ── NEW IMPORT ──
import { usePresenceSocket } from '../websocket/presence_websocket/usePresenceSocket';

const Stack = createNativeStackNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007aff" />
    </View>
  );
}

export default function AppNavigator() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isCheckingAuth } = useAppSelector((state) => state.auth);
  const { data: user, isLoading, error } = useCheckAuth();

  // ── NEW: Connect/Disconnect Presence Socket based on Auth State ──
  // This ensures the socket lives for the entire authenticated session.
  usePresenceSocket(isAuthenticated);

  // Update auth state when checkAuth completes
  useEffect(() => {
    if (!isLoading && !isCheckingAuth) {
      dispatch(setAuthCheckComplete());
    }
  }, [isLoading, isCheckingAuth, dispatch]);

  // Show loading while checking auth
  if (isCheckingAuth || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});)(// src/navigation/MainTabNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ChatRoomsList } from '../screens/chatting_screens/ChatRoomsList';
import { HomeScreen } from '../screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a0a0a',
          borderTopColor: '#1a1a1a',
        },
        tabBarActiveTintColor: '#007aff',
        tabBarInactiveTintColor: '#666666',
      }}
    >
      <Tab.Screen 
        name="Chats" 
        component={ChatRoomsList}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};) give me full step by step guide) solution (This is where things get interesting. The backend search architecture is now good enough that the next challenge is **search UX**, not OpenSearch.

Instagram, TikTok, Twitter, LinkedIn, GitHub all follow roughly the same flow:

```text
User opens Search Screen
        ↓
Search input focused automatically
        ↓
User types
        ↓
Debounce (300-500ms)
        ↓
API Request
        ↓
Cancel previous request if still running
        ↓
Show loading spinner
        ↓
Display categorized results
```

---

# Step 1: Create a Search Screen

Add:

```text
src/screens/search_screens/
    SearchScreen.tsx
```

Then add it to tabs:

```tsx
<Tab.Screen
    name="Search"
    component={SearchScreen}
    options={{
        tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
        ),
    }}
/>
```

Result:

```text
Chats | Search | Profile
```

---

# Step 2: Create a Debounce Hook

Create:

```text
src/hooks/useDebounce.ts
```

```tsx
import { useState, useEffect } from 'react';

export function useDebounce<T>(
    value: T,
    delay: number = 400
) {
    const [debouncedValue, setDebouncedValue] =
        useState(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}
```

---

Why?

Without debounce:

```text
i
is
ish
ishi
ishim
```

creates:

```text
5 API requests
```

With debounce:

```text
i
is
ish
ishi
ishim
(wait 400ms)
```

creates:

```text
1 API request
```

---

# Step 3: Search State

Inside SearchScreen:

```tsx
const [query, setQuery] = useState('');
```

```tsx
const debouncedQuery =
    useDebounce(query, 400);
```

---

# Step 4: Search Hook

```tsx
const {
    data,
    isLoading,
    isFetching,
} = useGlobalSearch(
    {
        q: debouncedQuery,
        limit: 5,
    },
    debouncedQuery.length >= 2
);
```

Notice:

```tsx
debouncedQuery.length >= 2
```

instead of:

```tsx
>= 1
```

Production systems usually wait for:

```text
2-3 characters
```

before searching.

---

# Step 5: Search Input

```tsx
<TextInput
    value={query}
    onChangeText={setQuery}
    placeholder="Search users, tags..."
    autoFocus
/>
```

AutoFocus is standard search UX.

Instagram does it.

TikTok does it.

LinkedIn does it.

---

# Step 6: Show Loading State

Use:

```tsx
isFetching
```

not:

```tsx
isLoading
```

because:

```text
isLoading
```

only happens first request.

```text
isFetching
```

happens on every new search.

Example:

```tsx
{
    isFetching && (
        <ActivityIndicator />
    )
}
```

---

# Step 7: Empty Query State

When query is empty:

```text
Search users, tags, communities...
```

show:

```text
Recent Searches
Suggested Users
Trending Tags
```

NOT:

```text
No results
```

Production apps rarely show an empty page.

---

# Step 8: Results Layout

Do not mix everything together.

Bad:

```text
ishimwe
django
alpha_dev
python
```

Good:

```text
Users
-----------------
ishimwe
alpha_dev

Tags
-----------------
#django
#python
```

---

Something like:

```tsx
<FlatList />
```

for users

and

```tsx
<FlatList />
```

for tags

inside a parent

```tsx
<ScrollView />
```

---

# Step 9: User Result Component

Create:

```text
src/screens/search_screens/components/
    UserSearchItem.tsx
```

```tsx
<UserSearchItem
    username="ishimwe"
    firstName="Ishimwe"
    lastName="Dev"
/>
```

Later:

```text
profile picture
verified badge
followers count
```

---

# Step 10: Tag Result Component

Create:

```text
src/screens/search_screens/components/
    TagSearchItem.tsx
```

Display:

```text
#django
100 uses
```

Later:

```text
trend score
posts count
```

---

# Step 11: React Query Cache

Your configuration is already good:

```tsx
staleTime: 2 min
gcTime: 5 min
```

This means:

User searches:

```text
ish
```

then:

```text
django
```

then:

```text
ish
```

Again:

```text
No network request
```

Result comes from cache.

Very good.

---

# Step 12: Prevent Race Conditions

This is something many developers miss.

User types:

```text
ish
```

Request A sent.

Then:

```text
ishimwe
```

Request B sent.

Request B finishes first.

Request A finishes later.

Without protection:

```text
Old results overwrite new results.
```

React Query solves most of this automatically because:

```tsx
queryKey:
['globalSearch', params.q]
```

changes per search.

So you're already safe.

---

# Step 13: Search History

Production apps store:

```text
recent searches
```

locally.

Later add:

```text
src/storage/searchHistory.ts
```

using:

```tsx
AsyncStorage
```

Store:

```text
last 10 searches
```

---

# Step 14: Infinite Search Results

Right now:

```http
/search/global/?q=ish&limit=5
```

returns:

```text
5 users
5 tags
```

Good for autocomplete.

Later create:

```http
/search/users/?q=ish&cursor=...
```

for full search screens.

Instagram does:

```text
Autocomplete Search
↓
Tap "See All Users"
↓
Paginated Search
```

---

# Step 15: What I would build next

Your next implementation order should be:

```text
1. SearchScreen
2. useDebounce hook
3. Search Input
4. useGlobalSearch hook
5. Users Section
6. Tags Section
7. Loading Spinner
8. Empty State
9. Search History
10. Communities
11. Posts
```

The key thing is that your backend endpoint:

```http
GET /open_search_apis/search/global/?q=ish&limit=5
```

is already exactly the kind of endpoint a production mobile app wants for search suggestions/autocomplete. The frontend's job now is mostly debouncing, rendering sections, and giving a smooth typing experience.
) give me full code files and make sure you use dark colors as i did in (// src/screens/chatting_screens/ChatRoomsList.tsx
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
});)