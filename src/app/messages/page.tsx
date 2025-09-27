import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Search, Send } from 'lucide-react';

const conversations = [
  { name: 'Alice', message: 'Hey, how are your seedlings?', unread: 2, avatar: 'user1' },
  { name: 'Bob', message: 'Just sent you a link to that nutrient guide.', unread: 0, avatar: 'user2' },
  { name: 'Charlie', message: 'You got it!', unread: 0, avatar: 'user3' },
  { name: 'David', message: 'Let me know what you think of the new light.', unread: 1, avatar: 'user4' },
  { name: 'Eve', message: 'Check out this harvest!', unread: 0, avatar: 'user5' },
];

const messages = [
    { sender: 'them', text: 'Hey, how are your seedlings?' },
    { sender: 'me', text: 'Hey Alice! They just sprouted yesterday, looking good so far.' },
    { sender: 'them', text: 'Awesome! Keep an eye on the humidity.' },
    { sender: 'me', text: 'Will do, thanks for the tip!' },
]

export default function MessagesPage() {
  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Messages"
        description="Your private conversations."
      />
      <div className="flex-1 overflow-hidden">
        <div className="grid h-full grid-cols-1 md:grid-cols-[300px_1fr]">
          <div className="hidden flex-col border-r md:flex">
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search messages..." className="pl-9" />
              </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-1">
                {conversations.map((convo, index) => (
                    <button key={index} className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                        index === 0 && "bg-accent"
                    )}>
                    <Avatar>
                        <AvatarImage src={`https://picsum.photos/seed/${convo.avatar}/40/40`} />
                        <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                        <p className="font-semibold truncate font-headline">{convo.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{convo.message}</p>
                    </div>
                    {convo.unread > 0 && (
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {convo.unread}
                        </div>
                    )}
                    </button>
                ))}
                </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 border-b p-4">
                <Avatar>
                    <AvatarImage src={`https://picsum.photos/seed/user1/40/40`} />
                    <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <p className="font-semibold font-headline">Alice</p>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={cn("flex", msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                        <div className={cn("max-w-xs rounded-lg px-4 py-2", msg.sender === 'me' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                            <p>{msg.text}</p>
                        </div>
                    </div>
                ))}
                </div>
            </ScrollArea>
            <div className="border-t p-4">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2">
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
