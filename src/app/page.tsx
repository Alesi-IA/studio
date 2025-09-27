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

export default function FeedPage() {
  const feedImages = PlaceHolderImages.filter((img) =>
    img.id.startsWith('feed-')
  );

  return (
    <div className="w-full">
      <PageHeader
        title="Feed"
        description="See what's new in the CannaConnect community."
        className="px-4 md:px-8"
      />
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
                  Strain: Northern Lights
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
                  <span className="sr-only">Like</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <MessageCircle className="h-5 w-5" />
                  <span className="sr-only">Comment</span>
                </Button>
                <Button variant="ghost" size="icon">
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
              <div className="grid gap-1.5 text-sm">
                <p className="font-semibold">
                  {Math.floor(Math.random() * 500) + 10} likes
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
                  View all {Math.floor(Math.random() * 50) + 2} comments
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
