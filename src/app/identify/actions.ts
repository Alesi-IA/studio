
'use server';

import { ai } from '@/ai/genkit';
import { isApiKeyConfigured } from '@/ai/utils';
import { IdentifyStrainInputSchema, IdentifyStrainOutputSchema } from '@/app/ai/schemas';
import type { IdentifyStrainOutput } from './types';

export { type IdentifyStrainOutput } from './types';

const NO_API_KEY_ERROR = "La clave API de Gemini no está configurada. Por favor, añádela a tus variables de entorno para usar las funciones de IA.";

// --- DATOS DE DEMOSTRACIÓN ---
const demoIdentificationResult: IdentifyStrainOutput = {
  strainName: "Cosecha Dorada",
  potency: {
    thc: 22,
    cbd: 1,
    energy: 65,
  },
  problems: [
    "Puntas de las hojas ligeramente quemadas (posible exceso de nutrientes)",
    "Leve amarillamiento en hojas inferiores (posible deficiencia de nitrógeno)",
  ]
};
// --- FIN DE DATOS DE DEMOSTRACIÓN ---

export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  // MODO DEMO: Forzamos la devolución de datos de ejemplo para revisión de UI.
  console.warn("Identification is in DEMO mode. Returning example data.");
  return new Promise(resolve => setTimeout(() => resolve({ data: demoIdentificationResult, error: null }), 1500));

  /*
  // Lógica original de la API (desactivada temporalmente)
  if (!isApiKeyConfigured()) {
    return { data: null, error: NO_API_KEY_ERROR };
  }
  
  const validatedInput = IdentifyStrainInputSchema.safeParse({ photoDataUri });
  
  if (!validatedInput.success) {
    console.error('Validation failed:', validatedInput.error);
    return { data: null, error: 'La foto proporcionada no es válida.' };
  }

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: `Eres un experto en identificación y salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis.

1.  **Identifica la Cepa:** Determina la cepa más probable de la planta.
2.  **Estima la Potencia:** Proporciona un porcentaje estimado para THC y CBD. Además, proporciona un índice de "energía" de 0 (muy calmante) a 100 (muy energizante/hype).
3.  **Detecta Problemas:** Analiza la planta en busca de signos visibles de plagas (como arañas rojas, mosquitos de los hongos), enfermedades (como oídio, moho del cogollo) o deficiencias de nutrientes. Enumera cualquier problema que encuentres.

TODA tu respuesta debe ser en español.

Responde en formato JSON.

{{media url=photoDataUri}}`,
      output: {
        schema: IdentifyStrainOutputSchema,
      },
    });

    if (!output) {
      return { data: null, error: 'El modelo de IA no devolvió ninguna salida. Por favor, inténtalo de nuevo.' };
    }

    return { data: output, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Identification failed:', errorMessage);
    if (errorMessage.includes('API key not valid')) {
       return { data: null, error: 'La clave API de Gemini no es válida. Por favor, verifica que esté configurada correctamente.' };
    }
    return { data: null, error: `No se pudo identificar la cepa. ${errorMessage}` };
  }
  */
}
