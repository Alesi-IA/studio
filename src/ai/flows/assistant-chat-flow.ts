
'use server';
/**
 * @fileOverview A cultivation assistant chatbot.
 *
 * - assistantChat - Responds to user questions about cannabis cultivation and other topics, with image analysis capabilities.
 */

import { ai } from '@/ai/genkit';
import type { ChatMessage } from '@/app/chatbot/types';
import { GenerateRequest } from 'genkit';

export async function assistantChat(history: ChatMessage[]): Promise<string> {
  if (!history || history.length === 0) {
    return '¡Hola! Soy Canna-Toallín. ¿En qué te puedo ayudar hoy? Sube una foto o hazme una pregunta.';
  }

  const systemPrompt = `Eres un asistente amigable y útil llamado Canna-Toallín. Tu especialidad es el cultivo de cannabis, pero puedes hablar de cualquier tema.
Si el usuario sube una imagen, tu respuesta debe basarse principalmente en lo que ves en esa imagen. Analízala en busca de problemas, deficiencias o características notables y responde a la pregunta del usuario en ese contexto.
Mantén tus respuestas relativamente concisas y con un tono relajado y amigable.`;

  try {
    // Construct the prompt for Genkit. It can be a simple string array or a more complex object array for multimodal input.
    const genkitPrompt: GenerateRequest['prompt'] = history.map(msg => {
      // If the message has an image, create a multimodal part.
      if (msg.imageUrl) {
        return {
          text: msg.content,
          media: { url: msg.imageUrl }
        };
      }
      // Otherwise, it's just a text part.
      return msg.content;
    });

    const response = await ai.generate({
      model: 'googleai/gemini-pro-vision', // Use a vision model to process images
      system: systemPrompt,
      prompt: genkitPrompt,
    });

    return response.text ?? 'Parece que me quedé sin palabras. ¿Podrías intentarlo de nuevo?';
  } catch (error) {
    console.error('[AssistantChatError] Details:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return 'La clave API de Gemini no es válida. Por favor, verifica que esté configurada correctamente en tus variables de entorno.';
        }
        return `La IA devolvió un error: ${error.message}`;
    }
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
