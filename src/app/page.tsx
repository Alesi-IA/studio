
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
import { Heart, MessageCircle, MoreHorizontal, Send, Award, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import type { Post } from '@/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const stories = Array.from({ length: 10 }).map((_, i) => ({
  id: `story-${i}`,
  user: `usuario_${i}`,
  avatar: `https://picsum.photos/seed/story${i}/80/80`,
}));

const initialPosts: Post[] = PlaceHolderImages.filter(p => p.id.startsWith('feed-')).map((p, index) => ({
  id: p.id,
  authorId: `user-id-${index}`,
  authorName: `Cultivador${index + 1}`,
  authorAvatar: `https://picsum.photos/seed/user-id-${index}/40/40`,
  description: p.description,
  imageUrl: p.imageUrl,
  imageHint: p.imageHint,
  createdAt: new Date().toISOString(),
  likes: Math.floor(Math.random() * 200),
  comments: Array.from({ length: Math.floor(Math.random() * 5) }).map((_, i) => ({
    id: `comment-${p.id}-${i}`,
    authorName: `Comentador${i}`,
    text: `¡Qué buena cosecha! Se ve increíble.`,
  })),
}));


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const { user, isAdmin } = useAuth();
  
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState('');

  const loadPosts = () => {
    setLoading(true);
    // Simulating fetching posts
    const storedPosts = sessionStorage.getItem('mockPosts');
    const allPosts = storedPosts ? [...JSON.parse(storedPosts), ...initialPosts] : initialPosts;
    
    // Remove duplicates
    const uniquePosts = allPosts.filter((post, index, self) =>
        index === self.findIndex((t) => (
            t.id === post.id
        ))
    );
    
    // Sort posts by creation date
    const sortedPosts = uniquePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Load saved and liked state
    const storedSaved = sessionStorage.getItem('savedPosts');
    const savedPostIds = storedSaved ? new Set(JSON.parse(storedSaved)) : new Set();
    setSavedPosts(savedPostIds);
    
    const storedLiked = sessionStorage.getItem('likedPosts');
    const likedPostIds = storedLiked ? new Set(JSON.parse(storedLiked)) : new Set();
    setLikedPosts(likedPostIds);
    
    // Adjust likes count based on persisted state
    const finalPosts = sortedPosts.map(p => {
      const initialPost = initialPosts.find(ip => ip.id === p.id);
      let baseLikes = initialPost ? initialPost.likes : 0;
      if (p.id.startsWith('mock-post-') && p.likes) { // for user-created posts
        baseLikes = p.likes;
      }
      
      const isLiked = likedPostIds.has(p.id);
      
      // If a user-created post is liked, its initial like count might be 0.
      if (p.id.startsWith('mock-post-') && isLiked && baseLikes === 0) {
        // This seems tricky. Let's simplify. The state should reflect the reality.
        // `posts` state will hold the true like count.
      }
      return p;
    });

    setPosts(finalPosts);
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
    // Listen for custom event from NewPostForm or other components that modify posts
    window.addEventListener('storage', loadPosts);

    return () => {
      window.removeEventListener('storage', loadPosts);
    };
  }, []);
  
  const handleToggleSave = (postId: string) => {
    const newSavedPosts = new Set(savedPosts);
    if (newSavedPosts.has(postId)) {
      newSavedPosts.delete(postId);
    } else {
      newSavedPosts.add(postId);
    }
    setSavedPosts(newSavedPosts);
    sessionStorage.setItem('savedPosts', JSON.stringify(Array.from(newSavedPosts)));
     // Dispatch a storage event so other components (like profile) can react
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleLike = (postId: string) => {
    const newLikedPosts = new Set(likedPosts);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    let updatedLikes = post.likes || 0;

    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      updatedLikes--;
    } else {
      newLikedPosts.add(postId);
      updatedLikes++;
    }

    setLikedPosts(newLikedPosts);
    
    const updatedPosts = [...posts];
    updatedPosts[postIndex] = { ...post, likes: updatedLikes };
    setPosts(updatedPosts);
    
    sessionStorage.setItem('likedPosts', JSON.stringify(Array.from(newLikedPosts)));
  };

  const handleAddComment = (postId: string) => {
    if (!commentText.trim() || !user) return;

    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName: user.displayName || 'Tú',
      text: commentText,
    };

    const updatedPosts = posts.map(p =>
      p.id === postId ? { ...p, comments: [...(p.comments || []), newComment] } : p
    );
    setPosts(updatedPosts);
    setCommentText(''); // Clear input after submitting
  };

  const handleDelete = async (postToDelete: Post) => {
    try {
        // This is a mock delete. In a real app, this would be an API call.
        const updatedPosts = posts.filter(p => p.id !== postToDelete.id);
        
        // Also remove from sessionStorage if it's a user-created post
        const storedPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
        const updatedStoredPosts = storedPosts.filter((p: Post) => p.id !== postToDelete.id);
        sessionStorage.setItem('mockPosts', JSON.stringify(updatedStoredPosts));

        setPosts(updatedPosts);

    } catch (error) {
        console.error("Error al eliminar la publicación (simulado): ", error);
        // Here you would show a toast to the user
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setEditingDescription(post.description);
  };

  const handleSaveEdit = async () => {
    if (!editingPost) return;
    
    // Mock saving the edit
    const updatedPosts = posts.map(p => 
        p.id === editingPost.id ? { ...p, description: editingDescription } : p
    );
    setPosts(updatedPosts);

    // Also update in sessionStorage if it's a user-created post
    const storedPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
    const updatedStoredPosts = storedPosts.map((p: Post) => 
        p.id === editingPost.id ? { ...p, description: editingDescription } : p
    );
    sessionStorage.setItem('mockPosts', JSON.stringify(updatedStoredPosts));

    setEditingPost(null);
  };

  return (
    <div className="w-full">
      <div className="p-4 md:px-8">
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex w-max space-x-4 pb-4">
            {stories.map((story) => (
              <figure key={story.id} className="shrink-0">
                <div className="w-20 h-20 rounded-full p-1 ring-2 ring-primary ring-offset-2 ring-offset-background">
                    <Avatar className="w-full h-full">
                        <AvatarImage src={story.avatar} alt={story.user} />
                        <AvatarFallback>{story.user.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
                <figcaption className="pt-2 text-xs text-muted-foreground text-center truncate w-20">
                  {story.user}
                </figcaption>
              </figure>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      <div className="mx-auto max-w-2xl space-y-8 px-4 py-6 md:px-8">
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

        {!loading && posts.map((post) => {
          const canManage = user?.uid === post.authorId || isAdmin;
          const isLiked = likedPosts.has(post.id);

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
                    href="#"
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
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src={post.imageUrl}
                    alt={post.description}
                    fill
                    className="object-cover"
                    data-ai-hint={post.imageHint}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4 p-4">
                <div className="flex w-full items-center">
                   <Button variant="ghost" size="icon" onClick={() => handleToggleLike(post.id)}>
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" >
                            <Award className="h-5 w-5" />
                            <span className="sr-only">Premiar</span>
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Premiar la mejor respuesta</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                   <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleToggleSave(post.id)}>
                      <Bookmark className={cn("h-5 w-5 transition-colors", savedPosts.has(post.id) ? 'fill-current' : '')} />
                      <span className="sr-only">Guardar</span>
                  </Button>
                </div>
                <div className="grid gap-1.5 text-sm w-full">
                  <p className="font-semibold">
                    {post.likes || 0} me gusta
                  </p>
                  <p>
                    <Link
                      href="#"
                      className="font-headline font-semibold hover:underline"
                    >
                      {post.authorName}
                    </Link>{' '}
                    {post.description}
                  </p>
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
                   <form onSubmit={(e) => { e.preventDefault(); handleAddComment(post.id); }} className='flex items-center gap-2 mt-2'>
                        <Input 
                            placeholder="Añadir un comentario..." 
                            className='h-8 text-xs'
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <Button type="submit" variant="ghost" size="sm" disabled={!commentText.trim()}>Publicar</Button>
                   </form>
                </div>
              </CardFooter>
            </Card>
          );
        })}
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
