
'use client';

import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Settings, LogOut, MessageCircle, Heart, MessageCircle as MessageIcon, Bookmark, UserCog, Sprout, Wheat, Grape, Award, Library, Loader2, Grid3x3, UserSquare, Crown, Send } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import type { Post, UserGuide, CannaGrowUser } from '@/types';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserGuideCard } from '@/components/user-guide-card';
import { EditProfileDialog } from '@/components/edit-profile-dialog';
import { XpRankDisplay } from '@/components/xp-rank-display';
import { useRouter } from 'next/navigation';


export const rankConfig = {
  0: { rankId: 0, label: 'Brote', icon: Sprout, color: 'text-green-400', badgeClass: 'bg-green-500/10 border-green-500 text-green-400', minXP: 0, maxXP: 19, leafColor: 'fill-green-500' },
  1: { rankId: 1, label: 'Aprendiz', icon: Wheat, color: 'text-yellow-400', badgeClass: 'bg-yellow-500/10 border-yellow-500 text-yellow-400', minXP: 20, maxXP: 99, leafColor: 'fill-yellow-500' },
  2: { rankId: 2, label: 'Cultivador', icon: Grape, color: 'text-purple-400', badgeClass: 'bg-purple-500/10 border-purple-500 text-purple-400', minXP: 100, maxXP: 299, leafColor: 'fill-orange-500' },
  3: { rankId: 3, label: 'Experto', icon: Award, color: 'text-blue-400', badgeClass: 'bg-blue-500/10 border-blue-500 text-blue-400', minXP: 300, maxXP: 999, leafColor: 'fill-red-500' },
  4: { rankId: 4, label: 'Maestro', icon: Award, color: 'text-orange-400', badgeClass: 'bg-orange-500/10 border-orange-500 text-orange-400', minXP: 1000, maxXP: Infinity, leafColor: 'fill-purple-500' },
};

const ownerRank = {
    rankId: 5,
    label: 'Dueño',
    icon: Crown,
    color: 'text-yellow-400',
    badgeClass: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
    leafColor: 'fill-yellow-400'
}

const getRank = (user: CannaGrowUser | null) => {
    if (!user) return rankConfig[0];
    if (user.role === 'owner') return ownerRank;
    const xp = user.experiencePoints || 0;
    if (xp >= 1000) return rankConfig[4];
    if (xp >= 300) return rankConfig[3];
    if (xp >= 100) return rankConfig[2];
    if (xp >= 20) return rankConfig[1];
    return rankConfig[0];
};

interface ProfilePageProps {
  params: {
    id: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { user: currentUser, loading: authLoading, logOut, addExperience, followUser, unfollowUser, updateUserProfile, prototypeUser } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<CannaGrowUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [isFollowHovered, setIsFollowHovered] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [userGuides, setUserGuides] = useState<UserGuide[]>([]);
  const [savedPostsState, setSavedPostsState] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [commentText, setCommentText] = useState('');
  
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const isOwnProfile = currentUser?.uid === params.id;
  const isFollowing = useMemo(() => currentUser?.followingIds?.includes(params.id) || false, [currentUser, params.id]);
  
  const rank = useMemo(() => getRank(profileUser), [profileUser]);

  useEffect(() => {
    setProfileLoading(true);
    // In prototype mode, we only have one user.
    if (params.id === prototypeUser.uid) {
        setProfileUser(prototypeUser);
    } else {
        // In a real app, you'd fetch other users. Here we show a placeholder.
        setProfileUser({
            uid: params.id,
            displayName: `Usuario ${params.id.slice(0,4)}`,
            email: 'other@user.com',
            role: 'user',
            photoURL: `https://picsum.photos/seed/${params.id}/128/128`,
            bio: 'Otro cultivador de la comunidad.',
            createdAt: new Date().toISOString(),
            experiencePoints: 150,
            followerCount: 42,
            followingCount: 5
        });
    }
    setUserPosts([]); // No real posts to show for other users in prototype
    setUserGuides([]);
    setSavedPostsState([]);
    setProfileLoading(false);
  }, [params.id, prototypeUser]);


  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser || isOwnProfile || isFollowLoading) return;

    setIsFollowLoading(true);
    if (isFollowing) {
      await unfollowUser(profileUser.uid);
    } else {
      await followUser(profileUser.uid);
    }
    setIsFollowLoading(false);
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/login');
  }

  const handleToggleLike = async (postId: string) => {
    if (!selectedPost || !currentUser) return;
    console.log('Simulating like toggle');
  };
  
  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !currentUser || !selectedPost) return;
    console.log('Simulating add comment');
    setCommentText('');
  };
  
  const handleToggleSave = async (postId: string) => {
    if (!currentUser) return;
    console.log('Simulating save toggle');
  };

  if (authLoading || profileLoading) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!profileUser) {
     return (
        <div className="w-full text-center py-20">
            <PageHeader title="Perfil no encontrado" description="El usuario que buscas no existe o ha sido eliminado." />
        </div>
    );
  }
  
  const currentRank = getRank(profileUser);
  const xpForNextRank = 'maxXP' in currentRank && currentRank.maxXP !== Infinity ? currentRank.maxXP + 1 : ('minXP' in currentRank ? currentRank.minXP : 0);

  return (
    <div className="w-full">
      <PageHeader
        title="Perfil"
        description="Tu espacio personal en CannaGrow."
        actions={
          isOwnProfile && currentUser?.role === 'owner' && (
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
              <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-2 ring-offset-2 ring-offset-background ring-primary">
                  <AvatarImage src={profileUser.photoURL} />
                  <AvatarFallback>{profileUser.displayName?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <h2 className="font-headline text-2xl font-bold">{profileUser.displayName}</h2>
               <Badge variant="secondary" className={cn("gap-1.5", rank.badgeClass)}>
                  <rank.icon className="h-3.5 w-3.5" />
                  {rank.label}
              </Badge>
            </div>
            
            <div className="flex justify-center md:justify-start gap-2">
                {isOwnProfile ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditProfileOpen(true)}>Editar Perfil</Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => setIsEditProfileOpen(true)}>Editar Perfil</DropdownMenuItem>
                             <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                 <LogOut className="mr-2 h-4 w-4"/>
                                 Cerrar Sesión
                             </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                    <>
                        <Button
                          variant={isFollowing ? 'outline' : 'default'}
                          onClick={handleFollowToggle}
                          onMouseEnter={() => setIsFollowHovered(true)}
                          onMouseLeave={() => setIsFollowHovered(false)}
                          className="w-32"
                          disabled={isFollowLoading}
                        >
                          {isFollowLoading ? (
                             <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isFollowing ? (
                            isFollowHovered ? 'Dejar de seguir' : 'Siguiendo'
                          ) : 'Seguir'}
                        </Button>
                        <Link href="/messages">
                            <Button variant="outline">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Mensaje
                            </Button>
                        </Link>
                    </>
                )}
            </div>
            
            <div className="flex justify-center flex-wrap gap-x-6 gap-y-2 md:justify-start">
              <div className="text-center">
                <p className="font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profileUser.followerCount || 0}</p>
                <p className="text-sm text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{profileUser.followingCount || 0}</p>
                <p className="text-sm text-muted-foreground">Siguiendo</p>
              </div>
            </div>

            {profileUser.role !== 'owner' && (
                <div className="pt-2 max-w-xs mx-auto md:mx-0">
                    <p className="text-sm text-muted-foreground text-center md:text-left mb-2">
                        Progreso al siguiente rango: {(profileUser.experiencePoints || 0)} / {xpForNextRank} XP
                    </p>
                    <XpRankDisplay
                        currentXp={profileUser.experiencePoints || 0}
                        rankId={currentRank.rankId}
                    />
                </div>
            )}

            <p className="text-sm max-w-prose mx-auto md:mx-0">{profileUser.bio}</p>
          </div>
        </div>
        
        {isOwnProfile && currentUser && (
          <EditProfileDialog
            isOpen={isEditProfileOpen}
            onOpenChange={setIsEditProfileOpen}
            user={currentUser}
          />
        )}

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="posts"><Grid3x3 className="h-5 w-5" /><span className="sr-only">Publicaciones</span></TabsTrigger>
            <TabsTrigger value="guides"><Library className="h-5 w-5" /><span className="sr-only">Guías</span></TabsTrigger>
            {isOwnProfile && <TabsTrigger value="saved"><Bookmark className="h-5 w-5" /><span className="sr-only">Guardados</span></TabsTrigger>}
            <TabsTrigger value="tagged"><UserSquare className="h-5 w-5" /><span className="sr-only">Etiquetados</span></TabsTrigger>
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
                        <div className="flex items-center gap-1 text-white font-bold"><Heart className='h-5 w-5' /> {post.likes || 0}</div>
                        <div className="flex items-center gap-1 text-white font-bold"><MessageIcon className='h-5 w-5' /> {post.comments?.length || 0}</div>
                    </div>
                    </div>
                ))}
                </div>
            ) : (
                 <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Grid3x3 className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">No hay publicaciones todavía</p>
                    <p className="text-sm">¡Cuando {isOwnProfile ? 'publiques' : `${profileUser.displayName} publique`} algo, aparecerá aquí!</p>
                </div>
            )}
          </TabsContent>
           <TabsContent value="guides" className="mt-6">
              {userGuides.length > 0 ? (
                <div className="space-y-6">
                  {userGuides.map((guide) => (
                    <UserGuideCard 
                      key={guide.id}
                      guide={guide}
                      currentUser={currentUser}
                      onUpdate={() => {}}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                    <Library className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-semibold">No se han escrito guías</p>
                     <p className="text-sm">Las guías escritas por {isOwnProfile ? 'ti' : profileUser.displayName} aparecerán aquí.</p>
                </div>
              )}
          </TabsContent>
          {isOwnProfile && <TabsContent value="saved" className="mt-6">
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
                        <div className="flex items-center gap-1 text-white font-bold"><Heart className='h-5 w-5' /> {post.likes || 0}</div>
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
          </TabsContent>}
          <TabsContent value="tagged" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <UserSquare className="h-12 w-12 mx-auto mb-4" />
                <p className="font-semibold">No hay publicaciones etiquetadas</p>
                <p className="text-sm">Cuando la gente etiquete a {isOwnProfile ? 'ti' : profileUser.displayName}, sus publicaciones aparecerán aquí.</p>
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
                         <Link href={`/profile/${selectedPost.authorId}`} className="font-headline font-semibold hover:underline">{selectedPost.authorName}</Link>
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
                                <Link href={`/profile/${selectedPost.authorId}`} className="font-headline font-semibold hover:underline">{selectedPost.authorName}</Link>
                                {' '}
                                {selectedPost.description}
                            </p>
                        </div>
                        {(selectedPost.comments || []).map(comment => (
                            <div key={comment.id} className="flex gap-4">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={comment.authorAvatar || `https://picsum.photos/seed/${comment.authorId}/32/32`} alt={comment.authorName} />
                                    <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className='text-sm'>
                                    <Link href={`/profile/${comment.authorId}`} className="font-headline font-semibold hover:underline">{comment.authorName}</Link>
                                    {' '}
                                    {comment.text}
                                </p>
                            </div>
                        ))}
                    </CardContent>
                </ScrollArea>
                 <CardFooter className="flex-col items-start gap-2 p-4 border-t bg-background mt-auto">
                    <div className="flex w-full items-center">
                        <Button variant="ghost" size="icon" onClick={() => handleToggleLike(selectedPost.id)} disabled={!currentUser}>
                            <Heart className={cn("h-5 w-5 transition-all", likedPosts.has(selectedPost.id) ? 'text-red-500 fill-red-500 animate-in zoom-in-125' : '')} />
                        </Button>
                        <Button variant="ghost" size="icon"><MessageIcon className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon"><Send className="h-5 w-5" /></Button>
                        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => handleToggleSave(selectedPost.id)}>
                            <Bookmark className={cn("h-5 w-5 transition-colors", currentUser?.savedPostIds?.includes(selectedPost.id) ? 'fill-current' : '')} />
                        </Button>
                    </div>
                    <p className="text-sm font-semibold">{selectedPost.likes || 0} me gusta</p>
                     {currentUser && <form onSubmit={(e) => { e.preventDefault(); handleAddComment(selectedPost.id); }} className='flex items-center gap-2 w-full'>
                        <Input 
                            placeholder="Añadir un comentario..." 
                            className='h-8 text-xs'
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                        />
                        <Button type="submit" variant="ghost" size="sm" disabled={!commentText.trim()}>Publicar</Button>
                    </form>}
                </CardFooter>
              </div>
            </div>
          )}
        </DialogContent>
       </Dialog>
    </div>
  );
}

