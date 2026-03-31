export interface Post {
  id: number;
  userId: number;
  userDisplayName: string;
  title?: string;
  content: string;
  category: string;
  jlptLevel?: string;
  likeCount: number;
  commentCount: number;
  imageUrl?: string;
  likedByCurrentUser: boolean;
  bookmarkedByCurrentUser: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  userDisplayName: string;
  content: string;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  roomId: string;
  userId: number;
  userDisplayName: string;
  content: string;
  createdAt: string;
}

export interface ChatTypingEvent {
  roomId: string;
  userId: number;
  userDisplayName: string;
  typing: boolean;
  createdAt: string;
}

export interface ChatSocketError {
  code: "RATE_LIMIT" | "MODERATION" | "UNAUTHORIZED" | "VALIDATION";
  message: string;
  createdAt: string;
}

export interface PagedPosts {
  content: Post[];
  totalPages: number;
  number: number;
}

export interface PagedComments {
  content: Comment[];
  totalPages: number;
}

export interface CommunityStats {
  totalPosts: number;
  totalComments: number;
  totalContributors: number;
  postsThisWeek: number;
  questionsCount: number;
  resourcesCount: number;
  trendingTags: string[];
}

export interface LeaderboardEntry {
  userId: number;
  userDisplayName: string;
  postsCount: number;
  commentsCount: number;
  likesReceived: number;
  score: number;
}
