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
import { Heart, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const stories = Array.from({ length: 10 }).map((_, i) => ({
  id: `story-${i}`,
  user: `usuario_${i}`,
  avatar: `https://picsum.photos/seed/story${i}/80/80`,
}));

export default function FeedPage() {
  const feedImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('feed-')
  );

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
        {feedImages.map((post, index) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={`https://picsum.photos/seed/user${index}/40/40`}
                  alt={`@user${index}`}
                />
                <AvatarFallback>{`U${index}`}</AvatarFallback>
              </Avatar>
              <div className="grid gap-0.5 text-sm">
                <Link
                  href="/profile"
                  className="font-headline font-semibold hover:underline"
                >
                  {`grower_handle_${index}`}
                </Link>
                <p className="text-xs text-muted-foreground">
                  Cepa: Northern Lights
                </p>
              </div>
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
              <div className="grid gap-1.5 text-sm">
                <p className="font-semibold">
                  {Math.floor(Math.random() * 500) + 10} me gusta
                </p>
                <p>
                  <Link
                    href="/profile"
                    className="font-headline font-semibold hover:underline"
                  >
                    {`grower_handle_${index}`}
                  </Link>{' '}
                  {post.description}
                </p>
                <Link href="#" className="text-muted-foreground">
                  Ver los {Math.floor(Math.random() * 50) + 2} comentarios
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
