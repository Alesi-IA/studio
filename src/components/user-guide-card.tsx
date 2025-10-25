
'use client';

import { useState, useEffect } from 'react';
import type { UserGuide, CannaGrowUser, UserGuideComment } from '@/types';
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
import { useAuth } from '@/hooks/use-auth';
import { useFirebase } from '@/firebase';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

interface UserGuideCardProps {
    guide: UserGuide;
    currentUser: CannaGrowUser | null;
    onUpdate: () => void;
}

export function UserGuideCard({ guide, currentUser, onUpdate }: UserGuideCardProps) {
    const { addExperience } = useAuth();
    const { firestore } = useFirebase();
    const [commentText, setCommentText] = useState('');

    const isLiked = currentUser && guide.likedBy?.includes(currentUser.uid);

    const handleToggleLike = async () => {
        if (!currentUser || !firestore) return;

        const guideRef = doc(firestore, 'userGuides', guide.id);
        
        if (isLiked) {
             await updateDoc(guideRef, {
                likedBy: arrayRemove(currentUser.uid),
            });
        } else {
            await updateDoc(guideRef, {
                likedBy: arrayUnion(currentUser.uid),
            });
            if (guide.authorId !== currentUser.uid) {
                addExperience(guide.authorId, 15);
            }
        }
        onUpdate();
    };
    
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentText.trim() || !currentUser || !firestore) return;
        
        if (guide.authorId !== currentUser.uid) {
            addExperience(guide.authorId, 20);
        }

        const newComment: UserGuideComment = {
            id: `ugc-${guide.id}-${Date.now()}`,
            authorId: currentUser.uid,
            authorName: currentUser.displayName || 'Anónimo',
            authorAvatar: currentUser.photoURL,
            text: commentText,
            createdAt: new Date().toISOString()
        };
        
        const guideRef = doc(firestore, 'userGuides', guide.id);
        await updateDoc(guideRef, {
            comments: arrayUnion(newComment),
        });
        
        setCommentText('');
        onUpdate();
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
                            <Link href={`/profile/${guide.authorId}`} className="font-medium hover:underline">
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
                    <Button variant="ghost" size="sm" onClick={handleToggleLike} disabled={!currentUser}>
                        <Heart className={cn("mr-2 h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
                        {guide.likedBy?.length || 0} Me gusta
                    </Button>
                    <Button variant="ghost" size="sm">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        {guide.comments?.length || 0} Comentarios
                    </Button>
                </div>

                <div className="w-full space-y-4">
                    {guide.comments && guide.comments.length > 0 && (
                         <ScrollArea className="max-h-40 w-full pr-4">
                            <div className="space-y-3">
                                {guide.comments.map(comment => (
                                    <div key={comment.id} className="text-sm flex items-start gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={comment.authorAvatar} />
                                            <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <p className="bg-muted px-3 py-2 rounded-lg">
                                            <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline">
                                                {comment.authorName}
                                            </Link>
                                            {' '}
                                            {comment.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    {currentUser && (
                        <form onSubmit={handleAddComment} className="flex w-full items-center gap-2">
                            <Input 
                                placeholder="Añadir un comentario..." 
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                className="h-9"
                            />
                            <Button type="submit" size="sm" disabled={!commentText.trim()}>Publicar</Button>
                        </form>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}
