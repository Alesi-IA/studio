
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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
import { useState } from 'react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
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

const stories = Array.from({ length: 10 }).map((_, i) => ({
  id: `story-${i}`,
  user: `usuario_${i}`,
  avatar: `https://picsum.photos/seed/story${i}/80/80`,
}));

// Simulamos el handle del usuario que ha iniciado sesión. 'admin' puede editar/eliminar todo.
const currentUserHandle = 'grower_handle_0'; // Este es nuestro admin
// const currentUserHandle = 'grower_handle_1'; // Para probar con un usuario normal

export default function FeedPage() {
  const [feedImages, setFeedImages] = useState<ImagePlaceholder[]>(
    PlaceHolderImages.filter((img) => img.id.startsWith('feed-'))
  );
  
  const [editingPost, setEditingPost] = useState<ImagePlaceholder | null>(null);
  const [editingDescription, setEditingDescription] = useState('');

  const handleDelete = (postId: string) => {
    setFeedImages((prev) => prev.filter((post) => post.id !== postId));
  };

  const handleEditClick = (post: ImagePlaceholder) => {
    setEditingPost(post);
    setEditingDescription(post.description);
  };

  const handleSaveEdit = () => {
    if (!editingPost) return;

    setFeedImages(prev => prev.map(p => 
      p.id === editingPost.id ? { ...p, description: editingDescription } : p
    ));
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
        {feedImages.map((post, index) => {
          const postAuthorHandle = `grower_handle_${index}`;
          const isOwner = postAuthorHandle === currentUserHandle;
          const isAdmin = currentUserHandle === 'grower_handle_0';

          return (
            <Card key={post.id} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={`https://picsum.photos/seed/user${index}/40/40`}
                    alt={`@${postAuthorHandle}`}
                  />
                  <AvatarFallback>{`U${index}`}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 gap-0.5 text-sm">
                  <Link
                    href="/profile"
                    className="font-headline font-semibold hover:underline"
                  >
                    {postAuthorHandle}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Cepa: Northern Lights
                  </p>
                </div>
                {(isOwner || isAdmin) && (
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
                          <AlertDialogAction onClick={() => handleDelete(post.id)}>
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
                    {Math.floor(Math.random() * 500) + 10} me gusta
                  </p>
                  <p>
                    <Link
                      href="/profile"
                      className="font-headline font-semibold hover:underline"
                    >
                      {postAuthorHandle}
                    </Link>{' '}
                    {post.description}
                  </p>
                  <Link href="#" className="text-muted-foreground">
                    Ver los {Math.floor(Math.random() * 50) + 2} comentarios
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
