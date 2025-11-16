
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, User, AlertTriangle } from 'lucide-react';
import { TowlieIcon } from '../icons/towlie';
import { handleChat } from '@/app/chatbot/actions';
import { Avatar, AvatarFallback } from '../ui/avatar';
import type { ChatMessage } from '@/app/chatbot/types';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

const AssistantAvatar = () => (
    <Avatar>
      <AvatarFallback className="bg-blue-400/20 border-2 border-blue-400/50">
        <TowlieIcon className="h-6 w-6 text-blue-300" />
      </AvatarFallback>
    </Avatar>
);

const UserAvatar = () => (
     <Avatar>
        <AvatarFallback className='bg-primary/20 border-2 border-primary/50'>
            <User className='h-5 w-5 text-primary' />
        </AvatarFallback>
    </Avatar>
)

interface AiChatConsoleProps {
    onClose: () => void;
}

export function AiChatConsole({ onClose }: AiChatConsoleProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Effect to fetch initial greeting
  useEffect(() => {
    const getInitialGreeting = async () => {
      setLoading(true);
      const response = await handleChat([]); // Pass empty history to get the greeting
      if (response.data) {
        setMessages([response.data]);
      } else if (response.error) {
        setError(response.error);
      }
      setLoading(false);
    };
    getInitialGreeting();
  }, []);

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('[data-viewport]');
    if (viewport) {
      setTimeout(() => {
        viewport.scrollTop = viewport.scrollHeight;
      }, 100);
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    const newMessages: ChatMessage[] = [...messages, userMessage];
    
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await handleChat(newMessages);
      
      if (response.error || !response.data) {
        setError(response.error || 'Lo siento, estoy un poco perdido. ¿Qué decías?');
      } else {
        setMessages(prev => [...prev, response.data]);
      }
    } catch (err) {
      setError('Vaya, parece que se me cruzaron los cables. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="h-full w-full max-w-4xl mx-auto flex flex-col bg-background/95 backdrop-blur-sm rounded-t-2xl border-t border-l border-r border-border/50 shadow-2xl shadow-primary/10">
        <header className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
             <div className="flex items-center gap-3">
                <AssistantAvatar />
                <div className='flex flex-col'>
                    <p className="font-semibold font-headline">Canna-Toallín</p>
                    <p className='text-xs text-muted-foreground'>Asistente de Cultivo IA</p>
                </div>
            </div>
        </header>

      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-8 p-6">
            <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div 
                key={i} 
                className={cn("flex items-start gap-3", m.role === 'user' ? 'justify-end' : 'justify-start')}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {m.role === 'model' && (
                    <AssistantAvatar />
                )}
                <div className={cn("rounded-2xl p-4 max-w-[85%] text-sm shadow-sm", m.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                    : 'bg-muted rounded-tl-none'
                )}>
                  <p>{m.content}</p>
                </div>
                 {m.role === 'user' && (
                    <UserAvatar />
                )}
              </motion.div>
            ))}
            </AnimatePresence>

            {loading && (
                 <motion.div 
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                 >
                    <AssistantAvatar />
                    <div className="rounded-2xl rounded-tl-none bg-muted p-4">
                        <p className="text-sm flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            Pensando...
                        </p>
                    </div>
                </motion.div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error del Asistente</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
      </ScrollArea>
      <footer className="p-4 bg-transparent mt-auto shrink-0">
        <form ref={formRef} onSubmit={handleSubmit} className="relative">
            <Input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    formRef.current?.requestSubmit();
                  }
                }}
                placeholder="Escribe tu pregunta aquí..."
                className="pr-12 h-12 rounded-full text-base border-2 border-border/80 focus:border-primary shadow-inner"
                disabled={loading}
            />
            <Button type="submit" size="icon" className="absolute right-2 top-1/2 h-9 w-9 -translate-y-1/2 rounded-full" disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
      </footer>
    </div>
  );
}
