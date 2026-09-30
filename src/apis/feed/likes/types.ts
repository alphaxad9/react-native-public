export type EntityType = 'post' | 'article' | 'video' | 'image'; // extend as needed

export interface ToggleLikeRequest {
  entity_id: string;
  entity_type: EntityType;
}

export interface ToggleLikeResponse {
  is_liked: boolean;
  entity_id: string;
  entity_type: EntityType;
}