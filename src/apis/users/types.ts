// types.ts

export interface UserItem {
  user_id: string;
  username: string;
  email: string;
  profile_picture: string | null;
  created_at: string; // ISO 8601 datetime
  follow_user: boolean;
  is_mine: boolean;
  follow_me_but_i_dont_follow: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
}

export interface Pagination {
  limit: number;
  offset: number;
  count: number;
}

export interface ListFilters {
  include_deleted?: boolean;
  include_followers?: boolean;
}

export interface UserDetailResponse {
  user: UserItem;
}

export interface UserListResponse {
  users: UserItem[];
  pagination: Pagination;
  filters?: ListFilters;
}

export interface FriendsResponse {
  friends: UserItem[];
  pagination: Pagination;
}

export interface FollowersResponse {
  followers: UserItem[];
  pagination: Pagination;
}

export interface DiscoverResponse {
  users: UserItem[];
  pagination: Pagination;
  filters: {
    include_followers: boolean;
  };
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface UserQueryParams {
  limit?: number;
  offset?: number;
  include_followers?: boolean;
  include_deleted?: boolean;
}