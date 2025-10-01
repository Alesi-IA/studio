
'use client';

import { PageHeader } from '@/components/page-header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Bot, Paperclip, Search, Send } from 'lucide-react';
import React, { useState } from 'react';
import { TowlieIcon } from '@/components/icons/towlie';

const initialConversations = [
  { id: 'chatbot', name: 'Canna-Toallín', message: '¡No olvides llevar una toalla!', unread: 1, avatar: 'towlie', isBot: true },
  { id: 'user1', name: 'Alice', message: 'Oye, ¿cómo van tus plántulas?', unread: 2, avatar: 'user1' },
  { id: 'user2', name: 'Bob', message: 'Te acabo de enviar un enlace...', unread: 0, avatar: 'user2' },
  { id: 'user3', name: 'Charlie', message: '¡Entendido!', unread: 0, avatar: 'user3' },
  { id: 'user4', name: 'David', message: 'Avísame qué te parece la nueva luz.', unread: 1, avatar: 'user4' },
  { id: 'user5', name: 'Eve', message: '¡Mira esta cosecha!', unread: 0, avatar: 'user5' },
];

const mockMessages = {
  chatbot: [
    { sender: 'them', text: '¡Hola! Soy Canna-Toallín. ¿Tienes alguna pregunta sobre cultivo? Y... no olvides llevar una toalla.' },
  ],
  user1: [
      { sender: 'them', text: 'Oye, ¿cómo van tus plántulas?' },
      { sender: 'me', text: '¡Hola Alice! Acaban de brotar ayer, se ven bien hasta ahora.' },
      { sender: 'them', text: '¡Genial! No pierdas de vista la humedad.' },
      { sender: 'me', text: '¡Lo haré, gracias por el consejo!' },
  ],
  user2: [
      { sender: 'them', text: 'Te acabo de enviar un enlace a esa guía de nutrientes.' },
  ],
  user3: [
    { sender: 'me', text: '¿Recibiste las fotos?' },
    { sender: 'them', text: '¡Entendido!' },
  ],
  user4: [
      { sender: 'them', text: 'Avísame qué te parece la nueva luz.' },
  ],
    user5: [
      { sender: 'them', text: '¡Mira esta cosecha!' },
      { sender: 'me', text: '¡Wow, se ve increíble! Felicidades.' },
  ],
};


export default function MessagesPage() {
    const [conversations, setConversations] = useState(initialConversations);
    const [selectedConvoId, setSelectedConvoId] = useState(conversations[0].id);

    const selectedConvo = conversations.find(c => c.id === selectedConvoId);
    const currentMessages = mockMessages[selectedConvoId] || [];

    return (
        <div className="flex h-full flex-col">
        <PageHeader
            title="Mensajes"
            description="Tus conversaciones privadas."
        />
        <div className="flex-1 overflow-hidden">
            <div className="grid h-full grid-cols-1 md:grid-cols-[300px_1fr]">
            <div className="hidden flex-col border-r md:flex">
                <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar mensajes..." className="pl-9" />
                </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-4 space-y-1">
                    {conversations.map((convo) => (
                        <button key={convo.id} className={cn(
                            "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                            selectedConvoId === convo.id && "bg-accent"
                        )}
                        onClick={() => setSelectedConvoId(convo.id)}
                        >
                         <Avatar>
                            {convo.isBot ? <AvatarFallback className="bg-primary/20"><TowlieIcon /></AvatarFallback> : <>
                                <AvatarImage src={`https://picsum.photos/seed/${convo.avatar}/40/40`} />
                                <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                            </>}
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
                {selectedConvo ? (
                    <>
                    <div className="flex items-center gap-3 border-b p-4">
                        <Avatar>
                            {selectedConvo.isBot ? <AvatarFallback className="bg-primary/20"><TowlieIcon /></AvatarFallback> : <>
                                <AvatarImage src={`https://picsum.photos/seed/${selectedConvo.avatar}/40/40`} />
                                <AvatarFallback>{selectedConvo.name.charAt(0)}</AvatarFallback>
                            </>}
                        </Avatar>
                        <p className="font-semibold font-headline">{selectedConvo.name}</p>
                    </div>
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                        {currentMessages.map((msg, index) => (
                            <div key={index} className={cn("flex items-end gap-2", msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                                {msg.sender === 'them' && (
                                    <Avatar className="h-8 w-8">
                                       {selectedConvo.isBot ? <AvatarFallback className="bg-primary/20"><TowlieIcon /></AvatarFallback> : <>
                                            <AvatarImage src={`https://picsum.photos/seed/${selectedConvo.avatar}/40/40`} />
                                            <AvatarFallback>{selectedConvo.name.charAt(0)}</AvatarFallback>
                                        </>}
                                    </Avatar>
                                )}
                                <div className={cn("max-w-xs md:max-w-md rounded-2xl px-4 py-2", msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted rounded-bl-none')}>
                                    <p>{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        </div>
                    </ScrollArea>
                    <div className="border-t p-4">
                        <div className="relative">
                            <Input placeholder="Escribe un mensaje..." className="pr-20" />
                            <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                                <Button size="icon" variant="ghost">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                                <Button size="icon" className="h-8 w-8">
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    </>
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <p>Selecciona una conversación para empezar a chatear.</p>
                    </div>
                )}
            </div>
            </div>
        </div>
        </div>
    );
}

    