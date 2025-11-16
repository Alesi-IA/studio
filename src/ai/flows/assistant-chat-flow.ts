
'use server';
/**
 * @fileOverview A cultivation assistant chatbot.
 *
 * - assistantChat - Responds to user questions about cannabis cultivation and other topics.
 */

import { ai } from '@/ai/genkit';
import type { ChatMessage } from '@/app/chatbot/types';

export async function assistantChat(history: ChatMessage[]): Promise<string> {
  // CRITICAL FIX: The AI model cannot handle an empty history.
  // We return a default greeting if the history is empty to start the conversation.
  if (!history || history.length === 0) {
    return '¡Hola! Soy Canna-Toallín. ¿En qué te puedo ayudar hoy?';
  }

  const systemPrompt = `Eres un asistente amigable y útil llamado Canna-Toallín. Tu especialidad es el cultivo de cannabis, pero puedes hablar de cualquier tema.
Mantén tus respuestas relativamente concisas y con un tono relajado y amigable.`;

  try {
    // The history needs to be mapped to a simple array of strings for the `generate` function.
    // The `ChatMessage` object structure is not directly supported as a prompt part.
    const formattedHistory = history.map(message => message.content);

    const response = await ai.generate({
      model: 'googleai/gemini-1.5-pro',
      system: systemPrompt,
      prompt: formattedHistory,
    });

    // In Genkit v1.x, the response text is accessed via the `text` property.
    // Provide a fallback message if the response is unexpectedly null.
    return response.text ?? 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError] Details:', error);
    // Propagate the actual error message for better debugging on the server action side.
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    // Generic error for any other issue (e.g., AI model failure).
    throw new Error('Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.');
  }
}
