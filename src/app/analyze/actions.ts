
'use server';

import { ai } from '@/ai/genkit';
import { isApiKeyConfigured } from '@/ai/utils';
import { AnalyzePlantInputSchema, AnalyzePlantOutputSchema } from '@/app/ai/schemas';
import type { AnalyzePlantOutput } from './types';

export { type AnalyzePlantOutput } from './types';

const NO_API_KEY_ERROR = "La clave API de Gemini no está configurada. Por favor, añádela a tus variables de entorno para usar las funciones de IA.";

// --- DATOS DE DEMOSTRACIÓN ---
const demoAnalysisResult: AnalyzePlantOutput = {
  problems: [
    "Deficiencia de Calcio",
    "Infestación de Araña Roja (Leve)"
  ],
  suggestions: [
    "Ajuste de pH y Cal-Mag: El amarillamiento y las manchas marrones pueden indicar una deficiencia de calcio, a menudo causada por un pH incorrecto en la zona radicular. Mide el pH de tu agua de riego y ajústalo a un rango de 6.0-6.5. Considera añadir un suplemento de Calcio-Magnesio (Cal-Mag) siguiendo las instrucciones del fabricante.",
    "Control de Araña Roja: Pequeños puntos en las hojas y telarañas finas son signos de araña roja. Para una infestación leve, rocía la planta (especialmente el envés de las hojas) con una mezcla de agua y jabón potásico o aceite de neem. Aumenta la humedad y mejora la circulación de aire para crear un ambiente menos favorable para ellas."
  ]
};
// --- FIN DE DATOS DE DEMOSTRACIÓN ---

export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  // MODO DEMO: Forzamos la devolución de datos de ejemplo para revisión de UI.
  console.warn("Analysis is in DEMO mode. Returning example data.");
  return new Promise(resolve => setTimeout(() => resolve({ data: demoAnalysisResult, error: null }), 1500));
  
  /*
  // Lógica original de la API (desactivada temporalmente)
  if (!isApiKeyConfigured()) {
    return { data: null, error: NO_API_KEY_ERROR };
  }
  
  const validatedInput = AnalyzePlantInputSchema.safeParse({ photoDataUri });
  
  if (!validatedInput.success) {
    console.error('Validation failed:', validatedInput.error);
    return { data: null, error: 'La foto proporcionada no es válida.' };
  }

  try {
    const { output } = await ai.generate({
      model: 'googleai/gemini-pro',
      prompt: `Eres un experto en la salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis en busca de posibles problemas, como deficiencias de nutrientes, plagas o enfermedades. Proporciona una lista de los problemas identificados y sugerencias para solucionarlos.

TODA tu respuesta debe ser en español.

Responde en formato JSON.

{{media url=photoDataUri}}`,
      output: {
        schema: AnalyzePlantOutputSchema,
      },
    });

    if (!output) {
      return { data: null, error: 'El modelo de IA no devolvió ninguna salida. Por favor, inténtalo de nuevo.' };
    }

    return { data: output, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Analysis failed:', errorMessage);
    if (errorMessage.includes('API key not valid')) {
       return { data: null, error: 'La clave API de Gemini no es válida. Por favor, verifica que esté configurada correctamente.' };
    }
    return { data: null, error: `No se pudo analizar la planta. ${errorMessage}` };
  }
  */
}
