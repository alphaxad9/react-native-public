// src/api/search/types.ts

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
}



// src/api/search/types.ts

// ... (keep your existing UserSearchResult, TagSearchResult, GlobalSearchResponse, GlobalSearchParams) ...

// --- Smart/Ranked User Search Types ---

export type FollowStatus = 'pending' | 'friends' | 'unfollowed' | null;

/**
 * Represents a single user result from the Smart/Ranked Search pipeline.
 * Includes social signals like mutual friends and follow status.
 */
export interface SmartUserSearchResult {
  id: string;
  username: string;
  first_name: string | null;
  last_name: string | null;
  creator_category: string | null;
  mutual_friend_count: number;
  follow_status: FollowStatus;
  follower_count: number;
}

/**
 * The unified response from the Smart User Search API.
 */
export interface SmartUserSearchResponse {
  results: SmartUserSearchResult[];
}

/**
 * Request parameters for the Smart User Search API.
 */
export interface SmartUserSearchParams {
  q: string; // The search query
}