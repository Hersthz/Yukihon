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
