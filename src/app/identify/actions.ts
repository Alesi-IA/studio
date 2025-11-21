
'use server';
import type { IdentifyStrainOutput } from './types';
export { type IdentifyStrainOutput } from './types';

// --- PUNTO DE INTEGRACIÓN PARA EL USUARIO ---
// Usaremos OpenRouter para la identificación de cepas.
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

/**
 * Handles strain identification by sending an image to an OpenRouter model.
 * @param photoDataUri The image of the plant as a data URI.
 * @returns A promise that resolves to the identification result.
 */
export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  
  // --- PUNTO DE INTEGRACIÓN PARA EL USUARIO ---
  // Aquí es donde realizarías la llamada real a la API de OpenRouter.
  // Necesitarás tu clave API, que deberías haber configurado en el archivo .env
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'YOUR_OPENROUTER_API_KEY_HERE') {
    const errorMsg = "La clave API de OpenRouter no está configurada. Por favor, añádela al archivo .env para activar la identificación de cepas.";
    console.error(errorMsg);
    return { data: null, error: errorMsg };
  }

  // Modelo multimodal para análisis de imagen en OpenRouter.
  const model = "qwen/qwen2.5-vl-32b-instruct:free"; 

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
    No incluyas explicaciones adicionales fuera del JSON. Si la imagen no es una planta de cannabis, responde con un JSON con 'strainName' como 'No es una planta de cannabis'.
  `;

  try {
    
    // CÓDIGO REAL PARA LLAMAR A LA API DE OPENROUTER CON IMÁGENES
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
    
    
  } catch (error) {
    console.error('[OpenRouterIdentificationError] Details:', error);
    if (error instanceof Error) {
      return { data: null, error: `Hubo un error al procesar la identificación: ${error.message}` };
    }
    return { data: null, error: 'Ocurrió un error desconocido durante la identificación.' };
  }
}
