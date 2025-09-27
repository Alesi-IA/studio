import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Settings } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  const userPosts = PlaceHolderImages.filter((img) =>
    img.id.startsWith('feed-')
  ).slice(0, 9);
  return (
    <div className="w-full">
      <PageHeader
        title="Profile"
        description="Your personal CannaConnect space."
      />
      <div className="container mx-auto p-4 md:p-8">
        <div className="mb-8 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-primary/50">
            <AvatarImage src="https://picsum.photos/seed/user-main/128/128" />
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="flex flex-col items-center gap-4 md:flex-row">
              <h2 className="font-headline text-2xl font-bold">CannaChampion</h2>
              <div className="flex items-center gap-2">
                <Button>Follow</Button>
                <Button variant="outline">Message</Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-center gap-6 md:justify-start">
              <div className="text-center">
                <p className="font-bold">{userPosts.length}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold">1.2k</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold">142</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
            <p className="text-sm">
              Passionate grower since 2010. Specializing in organic, living
              soil techniques. Here to share knowledge and see your beautiful
              plants! 🌿
            </p>
          </div>
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList>
            <TabsTrigger value="posts">My Grow</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="tagged">Tagged</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="mt-6">
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 md:gap-4">
              {userPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-md"
                >
                  <Image
                    src={post.imageUrl}
                    alt={post.description}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={post.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="saved" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No Saved Posts</p>
                <p className="text-sm">Posts you save will appear here.</p>
            </div>
          </TabsContent>
          <TabsContent value="tagged" className="mt-6">
            <div className="text-center text-muted-foreground p-12 border-2 border-dashed rounded-lg">
                <p className="font-semibold">No Tagged Posts</p>
                <p className="text-sm">When people tag you in posts, they'll appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
