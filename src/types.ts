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
