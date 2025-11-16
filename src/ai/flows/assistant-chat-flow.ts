
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
    const response = await ai.generate({
      model: 'googleai/gemini-pro',
      system: systemPrompt,
      prompt: history.map(m => m.content), // Pass only the content strings
    });

    return response.text ?? 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError] Details:', error);
    // Propagate a user-friendly and specific error message for better debugging.
    if (error instanceof Error) {
        // Provide a more helpful message for common API key issues.
        if (error.message.includes('API key not valid')) {
            return 'La clave API de Gemini no es válida. Por favor, verifica que esté configurada correctamente en tus variables de entorno.';
        }
        return `La IA devolvió un error: ${error.message}`;
    }
    // Generic error for any other issue (e.g., AI model failure).
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
