
'use client';

import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { UserGuide } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';

interface UserGuideCardProps {
    guide: UserGuide;
    currentUser: User | null;
}

export function UserGuideCard({ guide, currentUser }: UserGuideCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [likes, setLikes] = useState(guide.likes);
    const [comments, setComments] = useState(guide.comments || []);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        const likedGuides = JSON.parse(sessionStorage.getItem('likedUserGuides') || '{}');
        setIsLiked(!!likedGuides[guide.id]);
    }, [guide.id]);

    const handleToggleLike = () => {
        const newIsLiked = !isLiked;
        const newLikes = newIsLiked ? likes + 1 : likes - 1;
        
        setIsLiked(newIsLiked);
        setLikes(newLikes);

        const likedGuides = JSON.parse(sessionStorage.getItem('likedUserGuides') || '{}');
        if (newIsLiked) {
            likedGuides[guide.id] = true;
        } else {
            delete likedGuides[guide.id];
        }
        sessionStorage.setItem('likedUserGuides', JSON.stringify(likedGuides));

        // Persist likes count change
        const allGuides = JSON.parse(sessionStorage.getItem('userGuides') || '[]');
        const guideIndex = allGuides.findIndex((g: UserGuide) => g.id === guide.id);
        if (guideIndex > -1) {
            allGuides[guideIndex].likes = newLikes;
            sessionStorage.setItem('userGuides', JSON.stringify(allGuides));
        }
    };
    
    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser) return;
        
        const newComment = {
            id: `ugc-${guide.id}-${Date.now()}`,
            authorName: currentUser.displayName || 'Anónimo',
            text: commentText,
        };
        
        const newComments = [...comments, newComment];
        setComments(newComments);
        setCommentText('');

        const allGuides = JSON.parse(sessionStorage.getItem('userGuides') || '[]');
        const guideIndex = allGuides.findIndex((g: UserGuide) => g.id === guide.id);
        if (guideIndex > -1) {
            allGuides[guideIndex].comments = newComments;
            sessionStorage.setItem('userGuides', JSON.stringify(allGuides));
        }
    };


    return (
        <Card>
            <CardHeader>
                <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarImage src={guide.authorAvatar} alt={guide.authorName} />
                        <AvatarFallback>{guide.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <CardTitle>{guide.title}</CardTitle>
                        <CardDescription>
                            Por{' '}
                            <Link href="#" className="font-medium hover:underline">
                                {guide.authorName}
                            </Link>
                            {' \u00B7 '}
                            <time dateTime={guide.createdAt}>
                                {formatDistanceToNow(new Date(guide.createdAt), { addSuffix: true, locale: es })}
                            </time>
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sm whitespace-pre-wrap">{guide.content}</p>
            </CardContent>
            <CardFooter className="flex-col items-start gap-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handleToggleLike}>
                        <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                        {likes} Me gusta
                    </Button>
                    <Button variant="ghost" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {comments.length} Comentarios
                    </Button>
                </div>

                <div className="w-full space-y-4">
                    {comments.length > 0 && (
                         <ScrollArea className="max-h-40 w-full pr-4">
                            <div className="space-y-3">
                                {comments.map(comment => (
                                    <div key={comment.id} className="text-sm flex gap-2">
                                        <p>
                                            <Link href="#" className="font-semibold hover:underline">
                                                {comment.authorName}
                                            </Link>
                                            : {comment.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                     <form onSubmit={handleAddComment} className="flex w-full items-center gap-2">
                        <Input 
                            placeholder="Añadir un comentario..." 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            className="h-9"
                        />
                        <Button type="submit" size="sm" disabled={!commentText.trim()}>Publicar</Button>
                    </form>
                </div>
            </CardFooter>
        </Card>
    );
}

