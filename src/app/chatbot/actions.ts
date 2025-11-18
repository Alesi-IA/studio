
'use server';

import { assistantChat } from "@/ai/flows/assistant-chat-flow";
import type { ChatMessage } from "./types";

const FEATURE_DISABLED_ERROR = "El chatbot de IA requiere el plan de pago (Blaze) de Firebase. Por favor, actualiza tu proyecto para habilitarlo.";


export async function handleChat(history: ChatMessage[]): Promise<{ data: ChatMessage | null; error: string | null }> {
  // Si la longitud del historial es 0, es la solicitud del saludo inicial, la permitimos.
  if (history.length === 0) {
    try {
      const result = await assistantChat(history);
      return { data: { role: 'model', content: result }, error: null };
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
      return { data: null, error: `Se produjo un error inesperado en el servidor: ${errorMessage}` };
    }
  }

  // Si hay historial, significa que el usuario está intentando interactuar. Devolvemos el error.
  console.warn("Chatbot is in SAFE DEMO mode. Returning feature disabled error.");
  return { data: null, error: FEATURE_DISABLED_ERROR };
}
