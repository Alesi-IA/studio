'use client';

import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck, LogOut, MessageCircle, Star, Heart, MessageCircle as MessageIcon, Bookmark, Send, Award } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';

const initialUserPosts: Post[] = PlaceHolderImages.filter(p => p.id.startsWith('feed-')).slice(0, 9).map((p, index) => ({
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

export default function ProfilePage() {
  const [userPosts, setUserPosts] = useState<Post[]>(initialUserPosts);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const { user, isAdmin, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const savedPostIds = JSON.parse(sessionStorage.getItem('savedPosts') || '[]');
    const allPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]').concat(initialUserPosts);
    const uniquePosts = allPosts.filter((post: Post, index: number, self: Post[]) =>
        index === self.findIndex((t) => (t.id === post.id))
    );
    const userSavedPosts = uniquePosts.filter((p: Post) => savedPostIds.includes(p.id));
    setSavedPosts(userSavedPosts);
  }, []);

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }
  
  const handleAddComment = (postId: string) => {
    if (!commentText.trim() || !user || !selectedPost) return;

    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName: user.displayName || 'Tú',
      text: commentText,
    };

    const updatedPost = { ...selectedPost, comments: [...(selectedPost.comments || []), newComment] };
    setSelectedPost(updatedPost);

    // Update the main post lists as well
    setUserPosts(userPosts.map(p => p.id === postId ? updatedPost : p));
    setSavedPosts(savedPosts.map(p => p.id === postId ? updatedPost : p));

    setCommentText(''); // Clear input
  };

  return (
    <div className="w-full">
      <PageHeader
        title="Perfil"
        description="Tu espacio personal en CannaGrow."
        actions={
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Link href="/admin">
                <Button variant="outline">
                  <ShieldCheck className="mr-2" />
                  Panel Admin
                </Button>
              </Link>
            )}
            <Button onClick={handleLogout} variant="outline"><LogOut className="mr-2"/>Cerrar Sesión</Button>
          </div>
        }
      />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/50">
            <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/128/128`} />
            <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <h2 className="font-headline text-2xl font-bold">{user?.displayName || 'Usuario'}</h2>
              {isAdmin && (
                <Badge variant="destructive" className="gap-1">
                    <ShieldCheck className="h-3 w-3" />
                    Administrador
                </Badge>
              )}
            </div>
            <div className="flex justify-center items-center gap-2 md:justify-start">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="font-bold font-headline text-lg">{isAdmin ? 'Maestro Cultivador' : 'Aprendiz de Cultivo'}</span>
            </div>
            <div className="flex justify-center gap-2">
                <Button variant="outline">Editar Perfil</Button>
                 <Link href="/messages">
                    <Button>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Enviar Mensaje
                    </Button>
                </Link>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
            </div>
            <div className="flex justify-center gap-6 md:justify-start">
              <div className="text-center">
                <p className="font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
              </div>
              <div className="text-center">
                <p className="font-bold">1.2k</p>
                <p className="text-sm text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold">142</p>
                <p className="text-sm text-muted-foreground">Siguiendo</p>
              </div>
            </div>
            <p className="text-sm max-w-prose">
              {isAdmin ? 
                'Dueño y operador de CannaGrow. Cultivador apasionado desde 2010. Especializado en técnicas de suelo vivo y orgánico. ¡Aquí para compartir conocimientos y ver sus hermosas plantas! 🌿' : 
                'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.'
              }
            </p>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Mis Publicaciones</TabsTrigger>
            <TabsTrigger value="saved">Guardados</TabsTrigger>
            <TabsTrigger value="tagged">Etiquetados</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-md cursor-pointer"
                  onClick={() => setSelectedPost(post)}
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={post.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white font-bold"><Heart className='h-5 w-5' /> {post.likes}</div>
                    <div className="flex items-center gap-1 text-white font-bold"><MessageIcon className='h-5 w-5' /> {post.comments?.length || 0}</div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            {savedPosts.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-4">
                {savedPosts.map((post) => (
                    <div
                    key={post.id}
                    className="group relative aspect-square overflow-hidden rounded-md cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                    >
                    <Image
                        src={post.imageUrl}
                        alt={post.description}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={post.imageHint}
                    />
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex items-center gap-1 text-white font-bold"><Heart className='h-5 w-5' /> {post.likes}</div>
                        <div className="flex items-center gap-1 text-white font-bold"><MessageIcon className='h-5 w-5' /> {post.comments?.length || 0}</div>
                     </div>
                    </div>
                ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Bookmark className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">No hay publicaciones guardadas</p>
                    <p className="text-sm">Las publicaciones que guardes aparecerán aquí.</p>
                </div>
            )}
          </TabsContent>
          <TabsContent value="tagged" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No hay publicaciones etiquetadas</p>
                <p className="text-sm">Cuando la gente te etiquete en publicaciones, aparecerán aquí.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

       <Dialog open={!!selectedPost} onOpenChange={(isOpen) => !isOpen && setSelectedPost(null)}>
        <DialogContent className="max-w-4xl p-0">
          {selectedPost && (
            <div className="flex flex-col md:flex-row h-[90vh]">
              <div className="relative w-full md:w-1/2 h-1/2 md:h-full">
                <Image src={selectedPost.imageUrl} alt={selectedPost.description} fill className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                <CardHeader className="flex flex-row items-center gap-3 border-b">
                   <Avatar>
                        <AvatarImage src={selectedPost.authorAvatar} alt={selectedPost.authorName} />
                        <AvatarFallback>{selectedPost.authorName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 gap-0.5 text-sm">
                        <span className="font-headline font-semibold">{selectedPost.authorName}</span>
                         {selectedPost.strain && <p className="text-xs text-muted-foreground">Cepa: {selectedPost.strain}</p>}
                    </div>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <CardContent className="p-4 space-y-4">
                        <div className="flex gap-4">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={selectedPost.authorAvatar} alt={selectedPost.authorName} />
                                <AvatarFallback>{selectedPost.authorName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <p className='text-sm'>
                                <Link href="#" className="font-headline font-semibold hover:underline">{selectedPost.authorName}</Link>
                                {' '}
                                {selectedPost.description}
                            </p>
                        </div>
                        {(selectedPost.comments || []).map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://picsum.photos/seed/${comment.authorName}/32/32`} alt={comment.authorName} />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className='text-sm'>
                                    <Link href="#" className="font-headline font-semibold hover:underline">{comment.authorName}</Link>
                                    {' '}
                                    {comment.text}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </ScrollArea>
                 <CardFooter className="flex-col items-start gap-2 p-4 border-t mt-auto">
                    <div className="flex w-full items-center">
                        <Button variant="ghost" size="icon"><Heart className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><MessageIcon className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><Send className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="ml-auto"><Bookmark className="h-5 w-5" /></Button>
                    </div>
                    <p className="text-sm font-semibold">{selectedPost.likes || 0} me gusta</p>
                     <form onSubmit={(e) => { e.preventDefault(); handleAddComment(selectedPost.id); }} className='flex items-center gap-2 w-full'>
                        <Input 
                            placeholder="Añadir un comentario..." 
                            className='h-8 text-sm'
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <Button type="submit" variant="ghost" size="sm" disabled={!commentText.trim()}>Publicar</Button>
                   </form>
                </CardFooter>
              </div>
            </div>
          )}
        </DialogContent>
       </Dialog>
    </div>
  );
}
