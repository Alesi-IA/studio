


export interface PostComment {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
    createdAt: string;
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
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    text: string;
    createdAt: string;
}

export interface UserGuide {
    id: string;
    authorId: string;
    authorName: string;
    authorAvatar?: string;
    title: string;
    content: string;
    createdAt: string;
    likedBy: string[]; // Array of user UIDs
    comments: UserGuideComment[];
}

export type CultivationPhase = 'germination' | 'vegetative' | 'flowering' | 'custom';

export interface CultivationTask {
    id: string;
    authorId: string;
    label: string;
    description?: string;
    completed: boolean;
    date: any; // Using `any` to match current usage, can be refined to `Timestamp` or `string`
    phase?: CultivationPhase;
}

export interface DictionaryTerm {
    id: string;
    term: string;
    definition: string;
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
    followerIds?: string[];
    followerCount?: number;
    followingIds?: string[];
    followingCount?: number;
    savedPostIds?: string[];
}
