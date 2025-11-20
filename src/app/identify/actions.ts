
'use server';
import type { IdentifyStrainOutput } from './types';
export { type IdentifyStrainOutput } from './types';

// --- PUNTO DE INTEGRACIÓN PARA EL USUARIO ---
// Usaremos OpenRouter para la identificación de cepas.
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const DEMO_IDENTIFICATION_DATA: IdentifyStrainOutput = {
  strainName: 'Cosecha Dorada (Demo)',
  potency: {
    thc: 22,
    cbd: 1,
    energy: 65,
  },
  problems: [
    'Puntas ligeramente quemadas (posible exceso de nutrientes)',
    'Hojas inferiores un poco amarillas (posible deficiencia de Nitrógeno)',
  ],
};


/**
 * Handles strain identification by sending an image to an OpenRouter model.
 * NOTE: This is a placeholder implementation.
 * @param photoDataUri The image of the plant as a data URI.
 * @returns A promise that resolves to the identification result.
 */
export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  
  // --- PUNTO DE INTEGRACIÓN PARA EL USUARIO ---
  // Aquí es donde realizarías la llamada real a la API de OpenRouter.
  // Necesitarás tu clave API, que deberías haber configurado en el archivo .env
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    console.warn("OpenRouter API key not configured. Returning demo data for identification.");
    return new Promise(resolve => setTimeout(() => resolve({ data: DEMO_IDENTIFICATION_DATA, error: null }), 1500));
  }

  // Modelo multimodal recomendado para análisis de imagen en OpenRouter.
  // Puedes cambiarlo por otros como "anthropic/claude-3-sonnet" o "openai/gpt-4o"
  const model = "anthropic/claude-3-haiku"; 

  const prompt = `
    Analiza la siguiente imagen de una planta de cannabis en su fase de floración.
    Basándote en la forma de los cogollos, la estructura de la planta y las hojas, identifica la cepa más probable.
    Estima la potencia (THC, CBD) y el nivel de energía (0-100, donde 100 es muy energético/sativo).
    Además, identifica posibles problemas de salud de la planta.
    Responde ÚNICAMENTE con un objeto JSON que siga esta estructura:
    {
      "strainName": "Nombre de la Cepa",
      "potency": { "thc": 22, "cbd": 1, "energy": 65 },
      "problems": ["lista de problemas como strings"]
    }
    No incluyas explicaciones adicionales fuera del JSON.
  `;

  try {
    /*
    // EJEMPLO DE CÓDIGO PARA LLAMAR A LA API DE OPENROUTER CON IMÁGENES
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
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
        "response_format": { "type": "json_object" } // Pedir respuesta en formato JSON
      })
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("OpenRouter API Error:", errorData);
        return { data: null, error: `Error desde OpenRouter: ${errorData.error?.message || response.statusText}` };
    }

    const result = await response.json();
    const jsonResponse = JSON.parse(result.choices[0].message.content);
    
    // Aquí validamos que la respuesta del modelo tenga la estructura esperada.
    const formattedData: IdentifyStrainOutput = {
        strainName: jsonResponse.strainName || 'Desconocida',
        potency: {
            thc: jsonResponse.potency?.thc || 0,
            cbd: jsonResponse.potency?.cbd || 0,
            energy: jsonResponse.potency?.energy || 0,
        },
        problems: jsonResponse.problems || [],
    };

    return { data: formattedData, error: null };
    */

    // Por ahora, devolvemos una respuesta de demostración.
    // Descomenta el bloque anterior y elimina esta línea cuando estés listo para conectar la API.
    console.warn("Identification is in SAFE DEMO mode. Returning demo data.");
    return new Promise(resolve => setTimeout(() => resolve({ data: DEMO_IDENTIFICATION_DATA, error: null }), 1500));
    
  } catch (error) {
    console.error('[OpenRouterIdentificationError] Details:', error);
    if (error instanceof Error) {
      return { data: null, error: `Hubo un error al procesar la identificación: ${error.message}` };
    }
    return { data: null, error: 'Ocurrió un error desconocido durante la identificación.' };
  }
}
