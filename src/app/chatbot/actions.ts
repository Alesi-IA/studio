
'use server';

import { assistantChat } from "@/ai/flows/assistant-chat-flow";
import type { ChatMessage } from "./types";

const DEMO_CHAT_RESPONSE = "En una aplicación completamente funcional, analizaría tu pregunta y la imagen para darte una respuesta detallada. Por ahora, esta es una demostración. ¡Sigue explorando la app!";


export async function handleChat(history: ChatMessage[]): Promise<{ data: ChatMessage | null; error: string | null }> {
  // If the history length is 0, it's the request for the initial greeting, we allow it.
  if (history.length === 0) {
    try {
      const result = await assistantChat(history);
      return { data: { role: 'model', content: result }, error: null };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      return { data: null, error: `Se produjo un error inesperado en el servidor: ${errorMessage}` };
    }
  }

  // If there is history, it means the user is trying to interact. Return a friendly demo message.
  console.warn("Chatbot is in SAFE DEMO mode. Returning demo response.");
  return { data: { role: 'model', content: DEMO_CHAT_RESPONSE }, error: null };
}
