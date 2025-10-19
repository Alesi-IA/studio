'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { AiChatConsole } from '@/components/chatbot/ai-chat-console';
import { TowlieIcon } from '@/components/icons/towlie';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';


export default function MessagesPage() {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="w-full">
            <PageHeader
                title="Mensajes"
                description="Habla con tu asistente de cultivo personal."
            />
            <div className="flex flex-col items-center justify-center p-4 md:p-8 text-center" style={{ height: 'calc(100vh - 200px)' }}>
                 <div className="relative mb-8">
                    <div className="absolute -inset-2">
                        <div className="w-full h-full max-w-sm mx-auto lg:mx-0 opacity-30 blur-lg bg-gradient-to-r from-primary via-blue-400 to-secondary"></div>
                    </div>
                    <div className="relative flex items-center justify-center h-48 w-48 rounded-full bg-card border-2 border-primary/50 shadow-2xl">
                        <TowlieIcon className="h-28 w-28 text-blue-400" />
                    </div>
                </div>

                <h2 className="text-3xl font-headline font-bold mb-2">Canna-Toallín</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                    Tu asistente de IA está listo para ayudarte con cualquier pregunta sobre tu cultivo, o simplemente para charlar un rato.
                </p>
                
                <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
                    <SheetTrigger asChild>
                        <Button size="lg" className="rounded-full shadow-lg transform hover:scale-105 transition-transform">
                            <Sparkles className="mr-2 h-5 w-5" />
                            Iniciar Chat con Canna-Toallín
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-full w-full p-0 border-none bg-transparent">
                        <AiChatConsole onClose={() => setIsChatOpen(false)} />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
