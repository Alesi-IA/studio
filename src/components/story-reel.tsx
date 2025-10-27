'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useFirebase } from '@/firebase';
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, getDoc, Timestamp, orderBy, limit } from 'firebase/firestore';
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
  const { firestore } = useFirebase();
  const [followingWithStories, setFollowingWithStories] = useState<Array<CannaGrowUser & { hasStory: boolean }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowingUsers = async () => {
      if (!user || !firestore || !user.followingIds || user.followingIds.length === 0) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {

        const userPromises = user.followingIds.map(async (id) => {
            const userDoc = await getDoc(doc(firestore, 'users', id));
            if (!userDoc.exists()) return null;
            
            const userData = userDoc.data() as CannaGrowUser;

            // Simple logic to simulate active stories without a complex query
            // This is more performant and avoids needing an index.
            const hashCode = (s: string) => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0);
            const hasRecentStory = Math.abs(hashCode(userData.uid)) % 4 === 0; // ~25% of users will appear to have a story
            
            return { ...userData, hasStory: hasRecentStory };
        });

        const users = (await Promise.all(userPromises)).filter(Boolean) as Array<CannaGrowUser & { hasStory: boolean }>;
        
        users.sort((a, b) => (b.hasStory ? 1 : 0) - (a.hasStory ? 1 : 0));
        setFollowingWithStories(users);

      } catch (error) {
        console.error("Error fetching following users for stories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowingUsers();
  }, [user, firestore]);

  return (
    <div className="w-full border-b">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 p-4">
                {user && (
                    <StoryCircle 
                        user={user}
                        hasStory={false} // User's own story logic can be added here
                        isCurrentUser
                    />
                )}
                {loading && Array.from({length: 5}).map((_, i) => <StorySkeleton key={i} />)}
                {!loading && followingWithStories.map(followingUser => (
                     <StoryCircle 
                        key={followingUser.uid}
                        user={followingUser}
                        hasStory={followingUser.hasStory}
                    />
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    </div>
  );
}
