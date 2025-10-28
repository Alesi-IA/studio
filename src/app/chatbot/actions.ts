
'use server';

import { assistantChat } from "@/ai/flows/assistant-chat-flow";
import { isApiKeyConfigured } from "@/ai/genkit";
import type { ChatMessage } from "./types";

const NO_API_KEY_ERROR = "La clave API de Gemini no está configurada. Por favor, añádela a tu archivo .env para usar las funciones de IA.";

export async function handleChat(history: ChatMessage[]): Promise<{ data: ChatMessage | null; error: string | null }> {
  // Verificación definitiva en tiempo de ejecución.
  if (!isApiKeyConfigured()) {
    console.error("Chatbot action failed: Gemini API Key is not configured.");
    return { data: null, error: NO_API_KEY_ERROR };
  }

  try {
    const result = await assistantChat(history);
    return { data: { role: 'model', content: result }, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Chatbot action failed:', errorMessage);
    // Devuelve el error original para un mejor diagnóstico, en lugar de un mensaje genérico.
    return { data: null, error: `La IA devolvió un error: ${errorMessage}` };
  }
}
