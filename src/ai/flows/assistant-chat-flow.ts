'use server';
/**
 * @fileOverview Un chatbot asistente de cultivo.
 *
 * - assistantChat - Responde a las preguntas del usuario sobre el cultivo de cannabis y otros temas.
 */

import { ai } from '@/ai/genkit';
import type { ChatMessage } from '@/app/chatbot/types';
import { z } from 'zod';

// Zod schema for history validation. It expects an array of objects.
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
    // 1. Validate the incoming history array using the Zod schema.
    const validatedHistory = HistorySchema.parse(history);

    // 2. Generate the response using the validated history with the configured 'ai' instance.
    // In Genkit v1.x, the system prompt is passed in the 'system' property, not inside the prompt array.
    const response = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      system: systemPrompt,
      prompt: validatedHistory,
    });

    // In Genkit v1.x, the response text is accessed via the `text` property.
    return response.text ?? 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError]', error);
    if (error instanceof z.ZodError) {
      // This will give detailed information if the input format is wrong.
      console.error('Zod validation error:', error.errors);
      return 'Hubo un problema con el formato del historial de chat.';
    }
    // Propagate the actual error message for better debugging on the server action side.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    // Generic error for any other issue (e.g., AI model failure).
    throw new Error('Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.');
  }
}
