
'use server';
import type { AnalyzePlantOutput } from './types';
export { type AnalyzePlantOutput } from './types';

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Handles plant analysis by sending an image to an OpenRouter model.
 * @param photoDataUri The image of the plant as a data URI.
 * @returns A promise that resolves to the analysis result.
 */
export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    const errorMsg = "La clave API de OpenRouter no está configurada. Por favor, añádela al archivo .env para activar el análisis de plantas.";
    console.error(errorMsg);
    return { data: null, error: errorMsg };
  }

  const model = "qwen/qwen2.5-vl-32b-instruct:free"; 

  const prompt = `
    Analiza la siguiente imagen de una planta de cannabis.
    Identifica posibles problemas (deficiencias, plagas, enfermedades) y proporciona sugerencias de tratamiento.
    Responde ÚNICAMENTE con un objeto JSON que siga esta estructura:
    {
      "problems": ["lista de problemas como strings"],
      "suggestions": ["lista de sugerencias como strings, cada una con un título y descripción, ej: 'Título: Descripción.'"]
    }
    No incluyas explicaciones adicionales fuera del JSON. Si la imagen no es una planta de cannabis, responde con un JSON con listas vacías.
  `;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://canna-connect.app", // Añadido para validación
        "X-Title": "CannaConnect", // Añadido para validación
      },
      body: JSON.stringify({
        "model": model,
        "messages": [
          {
            "role": "user",
            "content": [
              { "type": "text", "text": prompt },
              { "type": "image_url", "image_url": { "url": photoDataUri } }
            ]
          }
        ],
        "response_format": { "type": "json_object" }
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        return { data: null, error: `Error desde OpenRouter: ${errorData.error?.message || response.statusText}` };
    }

    const result = await response.json();
    const jsonResponse = JSON.parse(result.choices[0].message.content);
    
    const formattedData: AnalyzePlantOutput = {
        problems: jsonResponse.problems || [],
        suggestions: jsonResponse.suggestions || [],
    };

    return { data: formattedData, error: null };

  } catch (error) {
    console.error('[OpenRouterAnalysisError] Details:', error);
    if (error instanceof Error) {
      return { data: null, error: `Hubo un error al procesar el análisis: ${error.message}` };
    }
    return { data: null, error: 'Ocurrió un error desconocido durante el análisis.' };
  }
}
