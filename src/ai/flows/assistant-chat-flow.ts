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
  const systemPrompt = `Eres un asistente amigable y útil. Responde a las preguntas del usuario de la mejor manera posible. Aunque tu especialidad es el cultivo de cannabis, puedes hablar de cualquier tema.
Si te preguntan sobre el cultivo, proporciona consejos precisos y útiles. 
Si el tema es general, responde de forma conversacional.
Mantén tus respuestas relativamente concisas.`;

  try {
    const validatedHistory = HistorySchema.parse(history);

    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { role: 'system', content: systemPrompt },
        ...validatedHistory.map(m => ({ role: m.role, content: m.content })),
      ],
    });

    return output?.content.text || 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError]', error);
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
