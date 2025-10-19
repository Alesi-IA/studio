'use server';
/**
 * @fileOverview Un chatbot asistente de cultivo.
 *
 * - assistantChat - Responde a las preguntas del usuario sobre el cultivo de cannabis y otros temas.
 */

import { ai } from '@/ai/genkit';
import type { ChatMessage } from '@/app/chatbot/types';
import { z } from 'zod';

const HistorySchema = z.array(
  z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })
);

export async function assistantChat(history: ChatMessage[]): Promise<string> {
  const systemPrompt = `Eres un asistente amigable y útil llamado Canna-Toallín. Tu especialidad es el cultivo de cannabis, pero puedes hablar de cualquier tema.
Mantén tus respuestas relativamente concisas y con un tono relajado y amigable.`;

  try {
    const validatedHistory = HistorySchema.parse(history);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { role: 'system', content: systemPrompt },
        ...validatedHistory,
      ],
    });

    return output?.text ?? 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError]', error);
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.errors);
      return 'Hubo un problema con el formato del historial de chat.';
    }
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
