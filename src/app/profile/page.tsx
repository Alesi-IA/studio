
'use client';

import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, ShieldCheck, LogOut, MessageCircle, Heart, MessageCircle as MessageIcon, Bookmark, Send, Crown, UserCog, UserCheck, User as UserIcon, ShieldHalf, Pencil } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Post } from '@/types';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useFirebase } from '@/firebase';
import { CircularProgress } from '@/components/ui/circular-progress';

const rankConfig = {
  owner: { label: 'Dueño', icon: Crown, color: 'text-yellow-400' },
  'co-owner': { label: 'Co-Dueño', icon: ShieldHalf, color: 'text-orange-400' },
  moderator: { label: 'Moderador', icon: ShieldCheck, color: 'text-blue-400' },
  user: { label: 'Usuario', icon: UserIcon, color: 'text-green-400' },
};


export default function ProfilePage() {
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [savedPostsState, setSavedPostsState] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  const { user, logOut, updateUserProfile } = useAuth();
  const { firebaseApp } = useFirebase();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const isUploading = uploadProgress !== null;

  const isOwnProfile = true; 
  
  const rank = useMemo(() => {
    return rankConfig[user?.role as keyof typeof rankConfig] || rankConfig.user;
  }, [user?.role]);

  const profileData = useMemo(() => ({
      displayName: user?.displayName || 'Usuario',
      photoURL: user?.photoURL || `https://picsum.photos/seed/${user?.uid}/128/128`,
      uid: user?.uid,
      bio: user?.role === 'owner' ? 'Dueño y fundador de CannaGrow. ¡Cultivando la mejor comunidad!' :
           user?.role === 'co-owner' ? 'Co-Dueño de CannaGrow. Ayudando a que todo funcione sin problemas.' :
           user?.role === 'moderator' ? 'Moderador de CannaGrow. Aquí para ayudar y mantener el buen ambiente.' :
           'Entusiasta del cultivo, aprendiendo y compartiendo mi viaje en CannaGrow.',
      rank,
      role: user?.role,
  }), [user, rank]);

  const loadPostsAndState = useCallback(() => {
    if (!user?.uid) return;
    const allPostsJSON = sessionStorage.getItem('mockPosts');
    const allPosts = allPostsJSON ? JSON.parse(allPostsJSON) : [];
    
    const savedPostIds = new Set(JSON.parse(sessionStorage.getItem('savedPosts') || '[]'));
    const userSavedPosts = allPosts.filter((p: Post) => savedPostIds.has(p.id));
    setSavedPostsState(userSavedPosts);

    const likedPostIds = new Set(JSON.parse(sessionStorage.getItem('likedPosts') || '[]'));
    setLikedPosts(likedPostIds);

    const myPosts = allPosts.filter((p: Post) => p.authorId === user.uid);
    setUserPosts(myPosts);

  }, [user?.uid]);

  useEffect(() => {
    if (!user) return;
    loadPostsAndState();
    window.addEventListener('storage', loadPostsAndState);
    return () => {
      window.removeEventListener('storage', loadPostsAndState);
    };
  }, [loadPostsAndState, user]);

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user || !firebaseApp) return;

    const storage = getStorage(firebaseApp);
    const storageRef = ref(storage, `profile-pictures/${user.uid}/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadProgress(0);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("Upload failed:", error);
        setUploadProgress(null);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          updateUserProfile({ photoURL: downloadURL });
          setUploadProgress(null);
        });
      }
    );
  };


  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }

  const handleToggleLike = (postId: string) => {
    if (!selectedPost) return;
    
    const newLikedPosts = new Set(likedPosts);
    let updatedLikes = selectedPost.likes || 0;

    if (newLikedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      updatedLikes--;
    } else {
      newLikedPosts.add(postId);
      updatedLikes++;
    }

    setLikedPosts(newLikedPosts);
    const updatedPost = { ...selectedPost, likes: updatedLikes };
    setSelectedPost(updatedPost);

    const updatePostInState = (p: Post) => p.id === postId ? updatedPost : p;
    setUserPosts(userPosts.map(updatePostInState));
    setSavedPostsState(savedPostsState.map(updatePostInState));
    sessionStorage.setItem('likedPosts', JSON.stringify(Array.from(newLikedPosts)));
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleAddComment = (postId: string) => {
    if (!commentText.trim() || !user || !selectedPost) return;

    const newComment = {
      id: `comment-${postId}-${Date.now()}`,
      authorName: user.displayName || 'Tú',
      text: commentText,
    };

    const updatedPost = { ...selectedPost, comments: [...(selectedPost.comments || []), newComment] };
    setSelectedPost(updatedPost);

    const updatePostInState = (p: Post) => p.id === postId ? updatedPost : p;
    setUserPosts(userPosts.map(updatePostInState));
    setSavedPostsState(savedPostsState.map(updatePostInState));
    
    const allPosts = JSON.parse(sessionStorage.getItem('mockPosts') || '[]');
    const postIndex = allPosts.findIndex((p: Post) => p.id === postId);
    if (postIndex > -1) {
        allPosts[postIndex] = updatedPost;
        sessionStorage.setItem('mockPosts', JSON.stringify(allPosts));
    }

    setCommentText(''); // Clear input
    window.dispatchEvent(new Event('storage'));
  };
  
  const handleToggleSave = (postId: string) => {
    const currentSaved = new Set(JSON.parse(sessionStorage.getItem('savedPosts') || '[]'));
    
    if (currentSaved.has(postId)) {
      currentSaved.delete(postId);
    } else {
      currentSaved.add(postId);
    }

    sessionStorage.setItem('savedPosts', JSON.stringify(Array.from(currentSaved)));
    window.dispatchEvent(new Event('storage'));
  };

  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div className="w-full">
      <PageHeader
        title="Perfil"
        description="Tu espacio personal en CannaGrow."
        actions={
          profileData.role === 'owner' && isOwnProfile && (
              <Link href="/admin">
                <Button variant="outline">
                  <UserCog className="mr-2" />
                  Panel Admin
                </Button>
              </Link>
          )
        }
      />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="relative group">
            <div className="relative rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-full p-1 bg-background">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={profileData.photoURL} />
                        <AvatarFallback>{profileData.displayName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>
            </div>
             {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <CircularProgress value={uploadProgress} />
              </div>
            )}
            {isOwnProfile && !isUploading && (
              <>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleProfileImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <Button 
                  size="icon" 
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <h2 className="font-headline text-2xl font-bold">{profileData.displayName}</h2>
              {profileData.role === 'owner' && (
                <Badge variant="destructive" className="gap-1 bg-yellow-500/10 border-yellow-500 text-yellow-400">
                    <Crown className="h-3 w-3" />
                    Dueño
                </Badge>
              )}
               {profileData.role === 'co-owner' && (
                <Badge variant="secondary" className="gap-1 bg-orange-500/10 border-orange-500 text-orange-400">
                    <ShieldHalf className="h-3 w-3" />
                    Co-Dueño
                </Badge>
              )}
               {profileData.role === 'moderator' && (
                <Badge variant="secondary" className="gap-1 bg-blue-500/10 border-blue-500 text-blue-400">
                    <ShieldCheck className="h-3 w-3" />
                    Moderador
                </Badge>
              )}
            </div>
            <div className={`flex justify-center items-center gap-2 md:justify-start ${profileData.rank.color}`}>
              <profileData.rank.icon className="h-5 w-5" />
              <span className="font-bold font-headline text-lg">{profileData.rank.label}</span>
            </div>
            
            <div className="flex justify-center md:justify-start gap-2">
                {isOwnProfile ? (
                    <>
                        <Button variant="outline">Editar Perfil</Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                 <DropdownMenuItem>Editar Perfil</DropdownMenuItem>
                                 <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                     <LogOut className="mr-2 h-4 w-4"/>
                                     Cerrar Sesión
                                 </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </>
                ) : (
                    <>
                        <Button>Seguir</Button>
                        <Link href="/messages">
                            <Button variant="outline">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Mensaje
                            </Button>
                        </Link>
                    </>
                )}
            </div>

            <div className="flex justify-center gap-6 md:justify-start">
              <div className="text-center">
                <p className="font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
              </div>
              <div className="text-center">
                <p className="font-bold">0</p>
                <p className="text-sm text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold">0</p>
                <p className="text-sm text-muted-foreground">Siguiendo</p>
              </div>
            </div>
            <p className="text-sm max-w-prose">{profileData.bio}</p>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">Mis Publicaciones</TabsTrigger>
            <TabsTrigger value="saved">Guardados</TabsTrigger>
            <TabsTrigger value="tagged">Etiquetados</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            {userPosts.length > 0 ? (
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
            ) : (
                 <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Bookmark className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">No has publicado nada</p>
                    <p className="text-sm">¡Crea tu primera publicación para compartirla con la comunidad!</p>
                </div>
            )}
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            {savedPostsState.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-4">
                {savedPostsState.map((post) => (
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
            <div className="flex flex-col md:flex-row md:max-h-[90vh]">
              <div className="relative w-full md:w-1/2 aspect-square md:aspect-auto">
                <Image src={selectedPost.imageUrl} alt={selectedPost.description} fill className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-tr-none" />
              </div>
              <div className="w-full md:w-1/2 flex flex-col">
                 <DialogHeader className="flex flex-row items-center gap-3 p-4 border-b">
                   <Avatar>
                         <AvatarImage src={selectedPost.authorAvatar} alt={selectedPost.authorName} />
                         <AvatarFallback>{selectedPost.authorName.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 gap-0.5 text-sm">
                         <DialogTitle className="sr-only">Publicación de {selectedPost.authorName}</DialogTitle>
                         <span className="font-headline font-semibold">{selectedPost.authorName}</span>
                         {selectedPost.strain && <p className="text-xs text-muted-foreground">Cepa: {selectedPost.strain}</p>}
                     </div>
                </DialogHeader>
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
                 <CardFooter className="flex-col items-start gap-2 p-4 border-t bg-background mt-auto">
                    <div className="flex w-full items-center">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleLike(selectedPost.id)}>
                            <Heart className={cn("h-5 w-5 transition-all", likedPosts.has(selectedPost.id) ? 'text-red-500 fill-red-500 animate-in zoom-in-125' : '')} />
                        </Button>
                        <Button variant="ghost" size="icon"><MessageIcon className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><Send className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleToggleSave(selectedPost.id)}>
                            <Bookmark className={cn("h-5 w-5 transition-colors", savedPostsState.some(p => p.id === selectedPost.id) ? 'fill-current' : '')} />
                        </Button>
                    </div>
                    <p className="text-sm font-semibold">{selectedPost.likes || 0} me gusta</p>
                     <form onSubmit={(e) => { e.preventDefault(); handleAddComment(selectedPost.id); }} className='flex items-center gap-2 w-full'>
                        <Input 
                            placeholder="Añadir un comentario..." 
                            className='h-8 text-xs'
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

    