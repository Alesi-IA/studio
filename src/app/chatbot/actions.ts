
'use server';

import { assistantChat } from "@/ai/flows/assistant-chat-flow";
import { isApiKeyConfigured } from "@/ai/utils";
import type { ChatMessage } from "./types";

const NO_API_KEY_ERROR = "La clave API de Gemini no está configurada. Por favor, añádela a tu archivo .env para usar las funciones de IA.";

export async function handleChat(history: ChatMessage[]): Promise<{ data: ChatMessage | null; error: string | null }> {
  // Verification is still useful for immediate feedback without an API call.
  if (!isApiKeyConfigured() && history.length > 0) {
    console.error("Chatbot action failed: Gemini API Key is not configured.");
    return { data: null, error: NO_API_KEY_ERROR };
  }

  try {
    const result = await assistantChat(history);
    // Return an error if the assistant flow itself returned an error message
    if (result.startsWith('La IA devolvió un error:') || result.startsWith('La clave API de Gemini no es válida')) {
        return { data: null, error: result };
    }
    return { data: { role: 'model', content: result }, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Chatbot action failed:', errorMessage);
    return { data: null, error: `Se produjo un error inesperado en el servidor: ${errorMessage}` };
  }
}
