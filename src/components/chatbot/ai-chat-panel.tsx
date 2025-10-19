
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { TowlieIcon } from '../icons/towlie';
import { handleChat } from '@/app/chatbot/actions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { ChatMessage } from '@/app/chatbot/types';

const AssistantAvatar = () => (
    <Avatar>
      <AvatarFallback className="bg-blue-300">
        <TowlieIcon className="h-6 w-6" />
      </AvatarFallback>
    </Avatar>
);

export function AiChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom
    const viewport = scrollAreaRef.current?.querySelector('[data-viewport]');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await handleChat([...messages, userMessage]);
      if (response.error || !response.data) {
        const errorMessage: ChatMessage = { role: 'model', content: response.error || 'Lo siento, estoy un poco perdido. ¿Qué decías?' };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = { role: 'model', content: 'Vaya, se me cruzaron los cables. Inténtalo de nuevo.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 border-b p-4 h-20">
         <AssistantAvatar />
        <div className='flex flex-col'>
            <p className="font-semibold font-headline">Canna-Toallín</p>
            <p className='text-xs text-muted-foreground'>Asistente de Cultivo IA</p>
        </div>
      </div>
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-6">
            <div className="flex items-start gap-3">
                <AssistantAvatar />
                <div className="rounded-lg bg-muted p-3 max-w-[85%]">
                    <p className="text-sm">¡Hola! Soy Canna-Toallín. Puedes preguntarme sobre cultivo o cualquier otra cosa. ¿En qué te puedo ayudar hoy?</p>
                </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                    <AssistantAvatar />
                )}
                <div className={`rounded-lg p-3 max-w-[85%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm">{m.content}</p>
                </div>
                 {m.role === 'user' && (
                    <Avatar>
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                )}
              </div>
            ))}
            {loading && (
                 <div className="flex items-start gap-3">
                    <AssistantAvatar />
                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Pensando...
                        </p>
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background">
        <form onSubmit={handleSubmit} className="relative">
            <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Escribe tu pregunta aquí..."
                className="pr-12"
                disabled={loading}
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </div>
    </>
  );
}
