
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Loader2, Send, User } from 'lucide-react';
import { TowlieIcon } from '../icons/towlie';
import { handleChat } from '@/app/chatbot/actions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { ChatMessage } from '@/app/chatbot/types';

export function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 md:bottom-6 md:right-6 h-16 w-16 rounded-full shadow-lg border-4 border-primary/20"
        >
          <TowlieIcon className="h-10 w-10" />
          <span className="sr-only">Abrir Asistente de Cultivo</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <TowlieIcon className="h-6 w-6" />
            Canna-Toallín
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 my-4 -mx-6 px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pr-2">
             <div className="flex items-start gap-3">
                <Avatar>
                    <AvatarFallback><Bot /></AvatarFallback>
                </Avatar>
                <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm">¡Hola! Soy Canna-Toallín. ¿Tienes alguna pregunta sobre cultivo? Y... no olvides llevar una toalla.</p>
                </div>
            </div>

            {messages.map((m, i) => (
              <div key={i} className={`flex items-start gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'model' && (
                    <Avatar>
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                )}
                <div className={`rounded-lg p-3 ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
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
                    <Avatar>
                        <AvatarFallback><Loader2 className="animate-spin" /></AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg bg-muted p-3">
                        <p className="text-sm">Uhm... ¿de qué estábamos hablando?... Ah, sí, ¡estoy pensando!</p>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="relative">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="No sé qué está pasando..."
            className="pr-12"
            disabled={loading}
          />
          <Button type="submit" size="icon" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
