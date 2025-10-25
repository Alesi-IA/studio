
export interface PostComment {
    id: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
}

export interface Post {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    strain?: string;
    description: string;
    imageUrl: string;
    imageHint?: string;
    width?: number;
    height?: number;
    createdAt: any;
    likes?: number;
    comments?: PostComment[];
    awards?: number;
}

export interface UserGuideComment {
    id: string;
    authorName: string;
    text: string;
}

export interface UserGuide {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    title: string;
    content: string;
    createdAt: string;
    likes: number;
    comments: UserGuideComment[];
}

// Unified user type
export interface CannaGrowUser {
    uid: string;
    email: string;
    displayName: string;
    role: 'owner' | 'co-owner' | 'moderator' | 'user';
    photoURL?: string;
    bio?: string;
    createdAt: string;
    experiencePoints?: number;
}
