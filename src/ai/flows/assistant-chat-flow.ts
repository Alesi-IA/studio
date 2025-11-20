'use server';
/**
 * @fileOverview A cultivation assistant chatbot powered by OpenRouter.
 *
 * - assistantChat - Responds to user questions about cannabis cultivation and other topics.
 */
import type { ChatMessage } from '@/app/chatbot/types';

const DEMO_CHAT_RESPONSE = "En una aplicación completamente funcional, mi cerebro de IA (conectado a OpenRouter) analizaría tu pregunta para darte una respuesta detallada. Por ahora, esta es una demostración. ¡Sigue explorando la app!";

/**
 * Handles the chat logic by sending the history to OpenRouter.
 * NOTE: This is a placeholder implementation.
 * @param history The chat history.
 * @returns A promise that resolves to the assistant's response.
 */
export async function assistantChat(history: ChatMessage[]): Promise<string> {
  if (!history || history.length === 0) {
    return '¡Hola! Soy Canna-Toallín, ahora conectado a OpenRouter. ¿En qué te puedo ayudar?';
  }

  // --- PUNTO DE INTEGRACIÓN PARA EL USUARIO ---
  // Aquí es donde realizarías la llamada real a la API de OpenRouter.
  // Necesitarás tu clave API de OpenRouter, que deberías haber configurado en el archivo .env

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    console.warn("OpenRouter API key not configured. Returning demo response.");
    return DEMO_CHAT_RESPONSE;
  }

  const model = "openai/gpt-3.5-turbo"; // O el modelo que prefieras de OpenRouter

  try {
    /*
    // EJEMPLO DE CÓDIGO PARA LLAMAR A LA API DE OPENROUTER
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": model,
        "messages": history.map(msg => ({ role: msg.role === 'model' ? 'assistant' : 'user', content: msg.content }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API Error:", errorData);
      return `Error al contactar a OpenRouter: ${errorData.error?.message || response.statusText}`;
    }

    const data = await response.json();
    const textResponse = data.choices[0].message.content;
    return textResponse;
    */

    // Por ahora, devolvemos una respuesta de demostración.
    // Descomenta el bloque anterior y elimina esta línea cuando estés listo para conectar la API.
    return DEMO_CHAT_RESPONSE;

  } catch (error) {
    console.error('[OpenRouterChatError] Details:', error);
    if (error instanceof Error) {
      return `Hubo un error al procesar la solicitud: ${error.message}`;
    }
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
