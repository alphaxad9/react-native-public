export type EntityType = 'post' | 'article' | 'video' | 'image'; // extend as needed

export interface CommentItem {
  comment_id: string;
  creator_id: string;
  entity_id: string;
  entity_type: EntityType;
  content: string;
  parent_id: string | null;
  number_of_replies: number;
  number_of_likes: number;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
  is_deleted: boolean;
  is_valid: boolean;
  is_reply: boolean;
}

export interface CommentsResponse {
  comments: CommentItem[];
  count: number;
  entity_id: string;
  entity_type: EntityType;
  limit: number;
  offset: number;
}

export interface CreateCommentRequest {
  entity_id: string;
  entity_type: EntityType;
  content: string;
  parent_id?: string; // optional for replies
}

// Optional: response for create comment (adjust if your API returns different shape)
export type CreateCommentResponse = CommentItem;