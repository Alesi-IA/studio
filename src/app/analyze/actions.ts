'use server';

import { genkit } from '@/ai/genkit';
import { AnalyzePlantInputSchema, AnalyzePlantOutputSchema } from '@/app/ai/schemas';
import type { AnalyzePlantOutput } from './types';

export { type AnalyzePlantOutput } from './types';

export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  // We only validate that we receive a string.
  const validatedInput = AnalyzePlantInputSchema.safeParse({ photoDataUri });
  
  if (!validatedInput.success) {
    console.error('Validation failed:', validatedInput.error);
    return { data: null, error: 'La foto proporcionada no es válida.' };
  }

  try {
    const { output } = await genkit.generate({
      prompt: `Eres un experto en la salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis en busca de posibles problemas, como deficiencias de nutrientes, plagas o enfermedades. Proporciona una lista de los problemas identificados y sugerencias para solucionarlos.

TODA tu respuesta debe ser en español.

Responde en formato JSON.

{{media url=photoDataUri}}`,
      model: 'googleai/gemini-1.5-flash',
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
    return { data: null, error: 'No se pudo analizar la planta. Es posible que el modelo de IA no esté disponible. Por favor, inténtalo de nuevo más tarde.' };
  }
}
