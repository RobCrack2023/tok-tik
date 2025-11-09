// Tipos para la aplicación Tok-Tik

export interface User {
  id: string;
  username: string;
  email: string;
  name: string | null;
  bio: string | null;
  avatar: string | null;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Video {
  id: string;
  userId: string;
  caption: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  duration: number | null;
  views: number;
  isPublic: boolean;
  commentsDisabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
  _count?: {
    likes: number;
    comments: number;
  };
  isLiked?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  verified: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  videoId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  user?: UserProfile;
}

export interface Like {
  id: string;
  userId: string;
  videoId: string;
  createdAt: Date;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
}

export interface VideoFeedResponse {
  videos: Video[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
