export interface PostItem {
  post_id: string;
  author_id: string;
  content: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  trend_score: number;
  views_last_24h: number;
  interactions_last_24h: number;
  is_deleted: boolean;
  is_valid: boolean;
  is_active: boolean;
  total_engagement: number;
  is_trending: boolean;
}
// types.ts (add these types if not already present)
export interface FeedPaginationParams {
  limit?: number;
  offset?: number;
}

export interface FeedPagination {
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface FeedItem {
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count?: number;
  is_trending: boolean;
  source?: string;
  [key: string]: unknown;
}

export interface FeedData {
  feed_id: string;
  user_id: string;
  items: FeedItem[];
  count?: number;
  generated_at?: string;
  expires_at?: string;
  [key: string]: unknown;
}

export interface FeedResponse {
  feed: FeedData;
  found: boolean;
  user_id: string;
  pagination: FeedPagination;
}
export interface Feed {
  feed_id: string;
  user_id: string;
  count: number;
  consumed_count: number;
  is_fresh: boolean;
  generated_at: string; // ISO 8601 datetime
  items: PostItem[];
  expires_at: string; // ISO 8601 datetime
}

export interface CreatePostRequest {
  content: string;
}

// ✅ Matches your actual backend response
export interface CreatePostResponse {
  post_id: string;
}

// Add this to your existing types.ts file

export interface CachedChunkResponse {
  status: 'success' | 'error';
  user_id: string;
  chunk_size: number;
  remaining_candidates: number;
  refill_triggered: boolean;
  posts: PostItem[];
}

// Update your existing PostItem interface to include the 'source' field
export interface PostItem {
  post_id: string;
  author_id: string;
  content: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  trend_score: number;
  views_last_24h: number;
  interactions_last_24h: number;
  is_deleted: boolean;
  is_valid: boolean;
  is_active: boolean;
  total_engagement: number;
  is_trending: boolean;
  source: string; // Add this field (empty string in your response)
}