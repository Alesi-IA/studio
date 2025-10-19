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
