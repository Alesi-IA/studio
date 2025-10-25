
'use client';

import Image from 'next/image';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, MoreHorizontal, Send, Award, Bookmark, BookHeart } from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect, useCallback } from 'react';
import type { Post } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { StoryReel } from '@/components/story-reel';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function FeedPage() {
  const { firestore } = useFirebase();
  const { user, isModerator, addExperience } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  
  const [commentStates, setCommentStates] = useState<Record<string, string>>({});

  const getInitialState = <T,>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
        const item = window.sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`Error reading sessionStorage key "${key}":`, error);
        return defaultValue;
    }
  };

  const [likedPosts, setLikedPosts] = useState<Set<string>>(() => getInitialState<string[]>('likedPosts', []));
  const [savedPosts, setSavedPosts] = useState<Set<string>>(() => getInitialState<string[]>('savedPosts', []));
  const [awardedPosts, setAwardedPosts] = useState<Set<string>>(() => getInitialState<string[]>('awardedPosts', []));

  const loadPosts = useCallback(async () => {
    if (!firestore || !user) {
      setLoading(false);
      return;
    };
    setLoading(true);

    try {
        // IDs to fetch: current user + people the user is following
        const authorIdsToFetch = [...(user.followingIds || []), user.uid];
        
        if (authorIdsToFetch.length === 0) {
            setPosts([]);
            setLoading(false);
            return;
        }

        const postsQuery = query(
            collection(firestore, "posts"), 
            where("authorId", "in", authorIdsToFetch),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(postsQuery);
        const fetchedPosts: Post[] = [];
        querySnapshot.forEach(doc => {
            fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
        });
        
        setPosts(fetchedPosts);

    } catch(e) {
      console.error("Failed to fetch posts", e)
      toast({ variant: 'destructive', title: 'Error al cargar el feed', description: 'No se pudieron obtener las publicaciones.' })
      setPosts([]);
    }
    setLoading(false);
  }, [firestore, user, toast]);

  useEffect(() => {
    loadPosts();
    // This is a placeholder for real-time updates.
    // In a real app, you'd use onSnapshot here.
    window.addEventListener('storage', loadPosts);
    return () => {
      window.removeEventListener('storage', loadPosts);
    };
  }, [loadPosts]);

  const handleCommentChange = (postId: string, text: string) => {
    setCommentStates(prev => ({ ...prev, [postId]: text }));
  };

  const persistInteractions = (key: 'likedPosts' | 'savedPosts' | 'awardedPosts', newSet: Set<string>) => {
    sessionStorage.setItem(key, JSON.stringify(Array.from(newSet)));
  };
  
  const handleToggleSave = (postId: string) => {
    const newSavedPosts = new Set(savedPosts);
    if (newSavedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);
    persistInteractions('savedPosts', newSavedPosts);
  };

  const handleToggleLike = (post: Post) => {
    const newLikedPosts = new Set(likedPosts);
    const postIndex = posts.findIndex(p => p.id === post.id);
    if (postIndex === -1) return;

    let currentLikes = post.likes || 0;
    const alreadyLiked = newLikedPosts.has(post.id);

    if (alreadyLiked) {
      newLikedPosts.delete(post.id);
      currentLikes--;
    } else {
      newLikedPosts.add(post.id);
      currentLikes++;
      if (user && post.authorId !== user.uid) {
        addExperience(post.authorId, 15); // +15 XP for a like
      }
    }
    setLikedPosts(newLikedPosts);

    const updatedPosts = [...posts];
    updatedPosts[postIndex] = { ...post, likes: Math.max(0, currentLikes) };
    setPosts(updatedPosts);
    
    // In a real app, this would be a Firestore update
    // setDoc(doc(firestore, 'posts', post.id), { likes: Math.max(0, currentLikes) }, { merge: true });
    persistInteractions('likedPosts', newLikedPosts);
  };

  const handleAddComment = (postId: string) => {
    const commentText = commentStates[postId];
    if (!commentText?.trim() || !user) return;
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;
    const post = posts[postIndex];

    if (post.authorId !== user.uid) {
        addExperience(post.authorId, 20); // +20 XP for a comment
    }

    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName: user.displayName || 'Tú',
      text: commentText,
    };

    const updatedPosts = posts.map(p =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    setPosts(updatedPosts);
    // Persist to session storage for mock
    sessionStorage.setItem('mockPosts', JSON.stringify(updatedPosts));
    handleCommentChange(postId, ''); // Clear input after submitting
  };

  const handleGiveAward = (post: Post) => {
    if (!user || user.uid === post.authorId || awardedPosts.has(post.id)) return;

    addExperience(post.authorId, 35); // +35 XP for an award
    
    const newAwardedPosts = new Set(awardedPosts);
    newAwardedPosts.add(post.id);
    setAwardedPosts(newAwardedPosts);
    persistInteractions('awardedPosts', newAwardedPosts);

    const updatedPosts = posts.map(p =>
        p.id === post.id ? { ...p, awards: (p.awards || 0) + 1 } : p
    );
    setPosts(updatedPosts);
    // Persist to session storage for mock
    sessionStorage.setItem('mockPosts', JSON.stringify(updatedPosts));

    toast({
        title: '¡Premio Otorgado!',
        description: `Has premiado la publicación de ${post.authorName}. ¡Ha ganado 35 XP!`,
    });
  };

  const handleDelete = async (postToDelete: Post) => {
    try {
        const updatedPosts = posts.filter(p => p.id !== postToDelete.id);
        setPosts(updatedPosts);
        // Persist to session storage for mock
        sessionStorage.setItem('mockPosts', JSON.stringify(updatedPosts));
    } catch (error) {
        console.error("Error al eliminar la publicación (simulado): ", error);
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditingDescription(post.description);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    const updatedPosts = posts.map(p => 
        p.id === editingPost.id ? { ...p, description: editingDescription } : p
    );
    setPosts(updatedPosts);
    // Persist to session storage for mock
    sessionStorage.setItem('mockPosts', JSON.stringify(updatedPosts));
    
    setEditingPost(null);
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-2xl space-y-8 py-6 md:py-8">
        <StoryReel />
        <div className="px-4 md:px-0 space-y-8">
            {loading && Array.from({length: 3}).map((_, i) => (
              <Card key={i}>
                <CardHeader className='flex-row items-center gap-3'>
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </CardHeader>
                <CardContent className='p-0'>
                  <Skeleton className="aspect-[4/5] w-full" />
                </CardContent>
                <CardFooter className='flex-col items-start p-4 gap-4'>
                   <Skeleton className="h-6 w-1/2" />
                   <Skeleton className="h-4 w-full" />
                </CardFooter>
              </Card>
            ))}

            {!loading && posts.length === 0 && (
              <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg flex flex-col items-center gap-4">
                <BookHeart className="h-16 w-16" />
                <h3 className="font-headline text-2xl font-semibold">Tu feed está vacío</h3>
                <p className="max-w-md">Cuando sigas a otros cultivadores, sus publicaciones aparecerán aquí. ¡Usa la pestaña de búsqueda para encontrar gente!</p>
              </div>
            )}

            {!loading && posts.map((post) => {
              const canManage = user?.uid === post.authorId || isModerator;
              const isLiked = likedPosts.has(post.id);
              const isSaved = savedPosts.has(post.id);
              const isAwarded = awardedPosts.has(post.id);
              const canAward = user && user.uid !== post.authorId && !isAwarded;

              return (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Avatar>
                      <AvatarImage
                        src={post.authorAvatar || `https://picsum.photos/seed/${post.authorId}/40/40`}
                        alt={post.authorName}
                      />
                      <AvatarFallback>{post.authorName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 gap-0.5 text-sm">
                      <Link
                        href={`/profile/${post.authorId}`}
                        className="font-headline font-semibold hover:underline"
                      >
                        {post.authorName}
                      </Link>
                      {post.strain && <p className="text-xs text-muted-foreground">
                        Cepa: {post.strain}
                      </p>}
                    </div>
                    {canManage && (
                      <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-5 w-5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(post)}>
                              Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem className="text-destructive">
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente la publicación.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(post)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                      <Image
                        src={post.imageUrl}
                        alt={post.description}
                        className="w-full h-auto object-cover"
                        data-ai-hint={post.imageHint}
                        width={post.width || 800}
                        height={post.height || 1000}
                      />
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-4 p-4">
                    <div className="flex w-full items-center">
                       <Button variant="ghost" size="icon" onClick={() => handleToggleLike(post)}>
                        <Heart className={cn("h-5 w-5 transition-all", isLiked ? 'text-red-500 fill-red-500 animate-in zoom-in-125' : '')} />
                        <span className="sr-only">Me gusta</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MessageCircle className="h-5 w-5" />
                        <span className="sr-only">Comentar</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Compartir</span>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleGiveAward(post)} disabled={!canAward}>
                        <Award className={cn("h-5 w-5 transition-all", isAwarded && 'text-yellow-400 fill-yellow-400 animate-in zoom-in-125')} />
                        <span className="sr-only">Premiar</span>
                      </Button>
                       <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleToggleSave(post.id)}>
                          <Bookmark className={cn("h-5 w-5 transition-colors", isSaved ? 'fill-foreground' : '')} />
                          <span className="sr-only">Guardar</span>
                      </Button>
                    </div>
                    <div className="grid gap-1.5 text-sm w-full">
                       <div className="flex items-center gap-4">
                            <p className="font-semibold">
                                {post.likes || 0} me gusta
                            </p>
                            {(post.awards || 0) > 0 && (
                                <div className="flex items-center gap-1 font-semibold text-yellow-500 text-xs">
                                    <Award className="h-4 w-4" />
                                    <span>{post.awards} {post.awards === 1 ? 'Premio' : 'Premios'}</span>
                                </div>
                            )}
                       </div>
                      <p>
                        <Link
                          href={`/profile/${post.authorId}`}
                          className="font-headline font-semibold hover:underline"
                        >
                          {post.authorName}
                        </Link>{' '}
                        {post.description}
                      </p>
                      {(post.comments || []).length > 0 && (
                        <ScrollArea className="max-h-24 pr-4">
                          {(post.comments || []).map(comment => (
                              <div key={comment.id} className="mt-1 flex gap-2">
                                <p>
                                  <Link href="#" className="font-headline font-semibold hover:underline">{comment.authorName}</Link>
                                  {' '}
                                  {comment.text}
                                </p>
                              </div>
                          ))}
                        </ScrollArea>
                      )}
                       <form onSubmit={(e) => { e.preventDefault(); handleAddComment(post.id); }} className='flex items-center gap-2 mt-2'>
                            <Input 
                                placeholder="Añadir un comentario..." 
                                className='h-8 text-xs'
                                value={commentStates[post.id] || ''}
                                onChange={(e) => handleCommentChange(post.id, e.target.value)}
                            />
                            <Button type="submit" variant="ghost" size="sm" disabled={!commentStates[post.id]?.trim()}>Publicar</Button>
                       </form>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
        </div>
      </div>

       <Dialog open={!!editingPost} onOpenChange={(isOpen) => !isOpen && setEditingPost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar descripción</DialogTitle>
          </DialogHeader>
          {editingPost && (
             <div className="grid gap-4 py-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-md">
                    <Image src={editingPost.imageUrl} alt="Vista previa de la edición" fill className="object-cover" />
                </div>
                <Textarea 
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    className="min-h-[100px]"
                    placeholder="Añade una descripción..."
                />
                <Button onClick={handleSaveEdit}>Guardar Cambios</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
