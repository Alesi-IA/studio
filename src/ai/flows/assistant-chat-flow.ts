
'use server';
/**
 * @fileOverview A cultivation assistant chatbot powered by OpenRouter.
 *
 * - assistantChat - Responds to user questions about cannabis cultivation and other topics.
 */
import type { ChatMessage } from '@/app/chatbot/types';

/**
 * Handles the chat logic by sending the history to OpenRouter.
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
    const errorMsg = "La clave API de OpenRouter no está configurada. Por favor, añádela al archivo .env para activar el chatbot.";
    console.error(errorMsg);
    return errorMsg;
  }

  const model = "meta-llama/llama-3.1-8b-instruct:free";

  try {
    
    // CÓDIGO REAL PARA LLAMAR A LA API DE OPENROUTER
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://canna-connect.app", // Añadido para validación
        "X-Title": "CannaConnect", // Añadido para validación
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
    

  } catch (error) {
    console.error('[OpenRouterChatError] Details:', error);
    if (error instanceof Error) {
      return `Hubo un error al procesar la solicitud: ${error.message}`;
    }
    return 'Vaya, parece que se me cruzaron los cables. No pude procesar esa pregunta.';
  }
}
