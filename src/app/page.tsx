
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
import { Heart, MessageCircle, MoreHorizontal, Send } from 'lucide-react';
import Link from 'next/link';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useEffect } from 'react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
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
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

const stories = Array.from({ length: 10 }).map((_, i) => ({
  id: `story-${i}`,
  user: `usuario_${i}`,
  avatar: `https://picsum.photos/seed/story${i}/80/80`,
}));

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  strain?: string;
  description: string;
  imageUrl: string;
  imageHint?: string;
  createdAt: any;
  likes?: number;
  comments?: number;
}

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
  comments: Math.floor(Math.random() * 50)
}));


export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [editingDescription, setEditingDescription] = useState('');
  const { user, isAdmin } = useAuth();

  const loadPosts = () => {
    setLoading(true);
    const storedPosts = sessionStorage.getItem('mockPosts');
    const allPosts = storedPosts ? [...JSON.parse(storedPosts), ...initialPosts] : initialPosts;
    
    // Remove duplicates
    const uniquePosts = allPosts.filter((post, index, self) =>
        index === self.findIndex((t) => (
            t.id === post.id
        ))
    );
    
    setPosts(uniquePosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  }

  useEffect(() => {
    loadPosts();
    // Listen for custom event from NewPostForm
    window.addEventListener('storage', loadPosts);

    return () => {
      window.removeEventListener('storage', loadPosts);
    };
  }, []);

  const handleDelete = async (postToDelete: Post) => {
    try {
        const updatedPosts = posts.filter(p => p.id !== postToDelete.id);
        const storedPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
        const updatedStoredPosts = storedPosts.filter((p: Post) => p.id !== postToDelete.id);

        sessionStorage.setItem('mockPosts', JSON.stringify(updatedStoredPosts));
        setPosts(updatedPosts);

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
                <div className="flex w-full items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
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
                  <Link href="#" className="text-muted-foreground">
                    Ver los {post.comments || 0} comentarios
                  </Link>
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

    