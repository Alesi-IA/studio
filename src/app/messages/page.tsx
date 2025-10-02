
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Paperclip, Search, Send, Users } from 'lucide-react';
import React, { useState } from 'react';
import { AiChatPanel } from '@/components/chatbot/ai-chat-panel';
import { TowlieIcon } from '@/components/icons/towlie';

const assistantConversation = {
  id: 'canna-toallin',
  name: 'Canna-Toallín',
  message: '¡No olvides llevar una toalla!',
  unread: 1,
  isAssistant: true,
};

const initialConversations = [
  { id: 'user1', name: 'Alice', message: 'Oye, ¿cómo van tus plántulas?', unread: 2, avatar: 'user1' },
  { id: 'user2', name: 'Bob', message: 'Te acabo de enviar un enlace...', unread: 0, avatar: 'user2' },
  { id: 'user3', name: 'Charlie', message: '¡Entendido!', unread: 0, avatar: 'user3' },
  { id: 'user4', name: 'David', message: 'Avísame qué te parece la nueva luz.', unread: 1, avatar: 'user4' },
  { id: 'user5', name: 'Eve', message: '¡Mira esta cosecha!', unread: 0, avatar: 'user5' },
  { id: 'user6', name: 'Frank', message: '¿Probaste los nutrientes orgánicos?', unread: 0, avatar: 'user6' },
  { id: 'user7', name: 'Grace', message: 'Mi planta tiene manchas amarillas :(', unread: 5, avatar: 'user7' },
];

const mockMessages: Record<string, { sender: 'me' | 'them'; text: string }[]> = {
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
    user6: [
      { sender: 'them', text: '¿Probaste los nutrientes orgánicos que te comenté?' },
      { sender: 'me', text: 'Todavía no, ¡pero están en mi lista para el próximo cultivo! Gracias por recordármelo.' },
  ],
    user7: [
        { sender: 'them', text: 'Ayuda, mi planta tiene manchas amarillas en las hojas de abajo. ¿Qué puede ser?' },
        { sender: 'me', text: 'Uhm, eso suena como una posible deficiencia de nitrógeno, es común en la etapa vegetativa. ¿Has revisado el pH del agua?' },
        { sender: 'them', text: '¡No lo he revisado! Lo haré ahora mismo. Gracias.' },
    ],
};


export default function MessagesPage() {
    const [conversations, setConversations] = useState([assistantConversation, ...initialConversations]);
    const [selectedConvoId, setSelectedConvoId] = useState(conversations[0].id);

    const selectedConvo = conversations.find(c => c.id === selectedConvoId);
    const currentMessages = mockMessages[selectedConvoId] || [];

    return (
        <div className="h-full w-full flex flex-col bg-background">
            <div className="flex-1 flex overflow-hidden">
                <div className="w-[300px] border-r flex flex-col">
                    <div className="p-4 border-b">
                        <h2 className="text-xl font-bold font-headline">Mensajes</h2>
                        <div className="relative mt-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Buscar conversaciones..." className="pl-9" />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                        {conversations.map((convo: any) => (
                            <button key={convo.id} className={cn(
                                "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent",
                                selectedConvoId === convo.id && "bg-accent"
                            )}
                            onClick={() => setSelectedConvoId(convo.id)}
                            >
                            <Avatar>
                                {convo.isAssistant ? (
                                    <div className="flex h-full w-full items-center justify-center bg-blue-300">
                                        <TowlieIcon className='h-7 w-7' />
                                    </div>
                                ) : (
                                    <>
                                    <AvatarImage src={`https://picsum.photos/seed/${convo.avatar}/40/40`} />
                                    <AvatarFallback>{convo.name.charAt(0)}</AvatarFallback>
                                    </>
                                )}
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

                <div className="flex-1 flex flex-col">
                    {selectedConvo ? (
                        selectedConvo.isAssistant ? (
                            <AiChatPanel />
                        ) : (
                        <>
                            <div className="flex items-center gap-3 border-b p-4 h-20">
                                <Avatar>
                                    <AvatarImage src={`https://picsum.photos/seed/${selectedConvo.avatar}/40/40`} />
                                    <AvatarFallback>{selectedConvo.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <p className="font-semibold font-headline">{selectedConvo.name}</p>
                            </div>
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-6">
                                {currentMessages.map((msg, index) => (
                                    <div key={index} className={cn("flex items-end gap-3", msg.sender === 'me' ? 'justify-end' : 'justify-start')}>
                                        {msg.sender === 'them' && (
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={`https://picsum.photos/seed/${selectedConvo.avatar}/40/40`} />
                                                <AvatarFallback>{selectedConvo.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        )}
                                        <div className={cn("max-w-xs md:max-w-md lg:max-w-lg rounded-2xl px-4 py-2", msg.sender === 'me' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-card border rounded-bl-none')}>
                                            <p className="text-base">{msg.text}</p>
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                            <div className="border-t p-4 bg-background">
                                <div className="relative">
                                    <Input placeholder="Escribe un mensaje..." className="pr-20" />
                                    <div className="absolute right-1 top-1/2 flex -translate-y-1/2 items-center">
                                        <Button size="icon" variant="ghost">
                                            <Paperclip className="h-5 w-5" />
                                            <span className="sr-only">Adjuntar archivo</span>
                                        </Button>
                                        <Button size="icon" className="h-8 w-8">
                                            <Send className="h-4 w-4" />
                                            <span className="sr-only">Enviar mensaje</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                        )
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center text-muted-foreground bg-card">
                            <Users className="h-16 w-16 mb-4"/>
                            <h3 className="text-xl font-bold font-headline">Tus Mensajes</h3>
                            <p className="max-w-xs">Selecciona una conversación para empezar a chatear o busca nuevos cultivadores.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
