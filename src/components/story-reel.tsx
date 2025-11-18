'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import type { CannaGrowUser } from '@/types';
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

function StoryCircle({ user, hasStory, isCurrentUser = false }: { user: CannaGrowUser | null; hasStory: boolean; isCurrentUser?: boolean }) {
    if (!user) return null;
    const ringClasses = hasStory ? 'bg-gradient-to-tr from-green-400 to-primary' : 'bg-border';

  return (
    <Link href={`/profile/${user.uid}`} className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
        <div className={cn('relative rounded-full p-1', ringClasses)}>
            <div className="bg-background rounded-full p-0.5">
                 <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={user.photoURL} alt={user.displayName} />
                    <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            {isCurrentUser && (
                 <Button size="icon" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background">
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
      <span className="text-xs font-medium w-full truncate text-center">{isCurrentUser ? 'Tu historia' : user.displayName}</span>
    </Link>
  );
}

function StorySkeleton() {
    return (
        <div className="flex flex-col items-center gap-2 flex-shrink-0 w-20">
            <Skeleton className="w-16 h-16 rounded-full p-1" />
            <Skeleton className="h-3 w-14" />
        </div>
    )
}

export function StoryReel() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // In prototype mode, we don't fetch stories. We just show the current user's circle.
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="w-full border-b">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 p-4">
                {loading ? (
                  <StorySkeleton />
                ) : user && (
                    <StoryCircle 
                        user={user}
                        hasStory={false}
                        isCurrentUser
                    />
                )}
                {/* Placeholder for other stories in a real scenario */}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    </div>
  );
}
