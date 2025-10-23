
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

function StoryCircle({ name, avatar, hasStory, isCurrentUser = false }: { name: string; avatar: string, hasStory: boolean; isCurrentUser?: boolean }) {
    const ringClasses = hasStory ? 'bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500' : 'bg-border';

  return (
    <div className="flex flex-col items-center gap-2 flex-shrink-0">
        <div className={`relative rounded-full p-1 ${ringClasses}`}>
            <div className="bg-background rounded-full p-0.5">
                 <Avatar className="w-16 h-16 border-2 border-background">
                    <AvatarImage src={avatar} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
            </div>
            {isCurrentUser && (
                 <Button size="icon" className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-background">
                    <Plus className="h-4 w-4" />
                </Button>
            )}
        </div>
      <span className="text-xs font-medium w-20 truncate text-center">{name}</span>
    </div>
  );
}

export function StoryReel() {
  const { user } = useAuth();

  return (
    <div className="w-full border-b">
        <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-4 p-4">
                {user && (
                    <StoryCircle 
                        name="Tu historia"
                        avatar={user.photoURL || ''}
                        hasStory={false}
                        isCurrentUser
                    />
                )}
            </div>
            <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
    </div>
  );
}
