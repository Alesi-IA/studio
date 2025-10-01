
'use server';

import { assistantChat } from "@/ai/flows/assistant-chat-flow";
import { z } from 'zod';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


export async function handleChat(history: ChatMessage[]): Promise<{ data: ChatMessage | null; error: string | null }> {
  try {
    const result = await assistantChat(history);
    return { data: { role: 'model', content: result }, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Chatbot failed:', errorMessage);
    return { data: null, error: 'Vaya, se me cruzaron los cables. Inténtalo de nuevo.' };
  }
}

    