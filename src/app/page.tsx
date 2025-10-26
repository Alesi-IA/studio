
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
import { collection, query, where, getDocs, orderBy, Timestamp, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';

export default function FeedPage() {
  const { firestore } = useFirebase();
  const { user, isModerator, addExperience, updateUserProfile } = useAuth();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  
  const [commentStates, setCommentStates] = useState<Record<string, string>>({});

  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [awardedPosts, setAwardedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Initialize state from sessionStorage on client mount
    const savedLiked = sessionStorage.getItem('likedPosts');
    if (savedLiked) {
      setLikedPosts(new Set(JSON.parse(savedLiked)));
    }
    const savedAwarded = sessionStorage.getItem('awardedPosts');
    if (savedAwarded) {
      setAwardedPosts(new Set(JSON.parse(savedAwarded)));
    }
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!firestore || !user?.uid) {
        setLoading(false);
        return;
      }
      setLoading(true);

      try {
          const authorIdsToFetch = [...(user.followingIds || []), user.uid];
          
          if (authorIdsToFetch.length === 0) {
              setPosts([]);
              setLoading(false);
              return;
          }

          const postsQuery = query(
              collection(firestore, "posts"), 
              where("authorId", "in", authorIdsToFetch)
          );

          const querySnapshot = await getDocs(postsQuery);
          let fetchedPosts: Post[] = [];
          querySnapshot.forEach(doc => {
              fetchedPosts.push({ id: doc.id, ...doc.data() } as Post);
          });
          
          // Sort posts on the client-side
          fetchedPosts.sort((a, b) => {
              const dateA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : 0;
              const dateB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : 0;
              return dateB - dateA;
          });

          setPosts(fetchedPosts);

      } catch(e) {
        console.error("Failed to fetch posts", e)
        toast({ variant: 'destructive', title: 'Error al cargar el feed', description: 'No se pudieron obtener las publicaciones.' })
        setPosts([]);
      }
      setLoading(false);
    };

    fetchPosts();
  }, [firestore, user?.uid, user?.followingIds]);

  const handleCommentChange = (postId: string, text: string) => {
    setCommentStates(prev => ({ ...prev, [postId]: text }));
  };

  const persistInteractions = (key: 'likedPosts' | 'awardedPosts', newSet: Set<string>) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, JSON.stringify(Array.from(newSet)));
    }
  };
  
  const handleToggleSave = async (postId: string) => {
    if (!user) return;
    const isCurrentlySaved = user.savedPostIds?.includes(postId) ?? false;
    let newSavedPostIds;
    
    if (isCurrentlySaved) {
      newSavedPostIds = user.savedPostIds?.filter(id => id !== postId);
    } else {
      newSavedPostIds = [...(user.savedPostIds || []), postId];
    }
    
    await updateUserProfile({ savedPostIds: newSavedPostIds });
  };


  const handleToggleLike = async (post: Post) => {
    if (!firestore || !user) return;
    const newLikedPosts = new Set(likedPosts);
    const alreadyLiked = newLikedPosts.has(post.id);

    if (alreadyLiked) {
      newLikedPosts.delete(post.id);
    } else {
      newLikedPosts.add(post.id);
    }
    setLikedPosts(newLikedPosts);
    persistInteractions('likedPosts', newLikedPosts);

    const postRef = doc(firestore, 'posts', post.id);
    const currentLikes = post.likes || 0;
    const newLikes = alreadyLiked ? currentLikes - 1 : currentLikes + 1;
    await updateDoc(postRef, { likes: newLikes });

    setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, likes: newLikes } : p));
    
    if (!alreadyLiked && user.uid !== post.authorId) {
        addExperience(post.authorId, 15);
    }
  };

  const handleAddComment = async (postId: string) => {
    const commentText = commentStates[postId];
    if (!commentText?.trim() || !user || !firestore) return;
    
    const postRef = doc(firestore, 'posts', postId);
    
    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName: user.displayName || 'Tú',
      authorAvatar: user.photoURL,
      authorId: user.uid,
      text: commentText,
      createdAt: new Date().toISOString(),
    };

    await updateDoc(postRef, {
        comments: arrayUnion(newComment)
    });

    const post = posts.find(p => p.id === postId);
    if (post && post.authorId !== user.uid) {
        addExperience(post.authorId, 20); // +20 XP for a comment
    }

    setPosts(prevPosts => prevPosts.map(p => 
        p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    ));
    handleCommentChange(postId, '');
  };

  const handleGiveAward = async (post: Post) => {
    if (!user || !firestore || user.uid === post.authorId || awardedPosts.has(post.id)) return;

    const newAwardedPosts = new Set(awardedPosts);
    newAwardedPosts.add(post.id);
    setAwardedPosts(newAwardedPosts);
    persistInteractions('awardedPosts', newAwardedPosts);

    const postRef = doc(firestore, 'posts', post.id);
    const newAwards = (post.awards || 0) + 1;
    await updateDoc(postRef, { awards: newAwards });

    setPosts(prevPosts => prevPosts.map(p => p.id === post.id ? { ...p, awards: newAwards } : p));
    
    addExperience(post.authorId, 35); // +35 XP for an award

    toast({
        title: '¡Premio Otorgado!',
        description: `Has premiado la publicación de ${post.authorName}. ¡Ha ganado 35 XP!`,
    });
  };

  const handleDelete = async (postToDelete: Post) => {
    if (!firestore) return;
    try {
        const postRef = doc(firestore, 'posts', postToDelete.id);
        await deleteDoc(postRef);
        setPosts(posts.filter(p => p.id !== postToDelete.id));
        toast({ title: 'Publicación eliminada' });
    } catch (error) {
        console.error("Error al eliminar la publicación: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo eliminar la publicación.' });
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditingDescription(post.description);
  };

  const handleSaveEdit = async () => {
    if (!editingPost || !firestore) return;
    
    const postRef = doc(firestore, 'posts', editingPost.id);
    await updateDoc(postRef, { description: editingDescription });
    
    setPosts(posts.map(p => 
        p.id === editingPost.id ? { ...p, description: editingDescription } : p
    ));
    setEditingPost(null);
    toast({ title: 'Publicación actualizada' });
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
              const isSaved = user?.savedPostIds?.includes(post.id) ?? false;
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
                        width={post.width || 800}
                        height={post.height || 1000}
                        className="w-full h-auto object-cover"
                        data-ai-hint={post.imageHint}
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
                                  <Link href={`/profile/${comment.authorId}`} className="font-headline font-semibold hover:underline">{comment.authorName}</Link>
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
