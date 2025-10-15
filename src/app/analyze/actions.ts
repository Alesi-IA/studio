'use server';

import { analyzePlantForProblems } from '@/ai/flows/analyze-plant-for-problems';
import type { AnalyzePlantOutput } from './types';
import { AnalyzePlantInputSchema } from '@/app/ai/schemas';

export { type AnalyzePlantOutput } from './types';

export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  // We only validate that we receive a string. The AI model will handle if the data URI is valid.
  const validatedInput = AnalyzePlantInputSchema.safeParse({ photoDataUri });
  
  if (!validatedInput.success) {
    console.error('Validation failed:', validatedInput.error);
    return { data: null, error: 'La foto proporcionada no es válida.' };
  }

  try {
    const result = await analyzePlantForProblems(validatedInput.data);
    return { data: result, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Analysis failed:', errorMessage);
    return { data: null, error: 'No se pudo analizar la planta. Es posible que el modelo de IA no esté disponible. Por favor, inténtalo de nuevo más tarde.' };
  }
}
