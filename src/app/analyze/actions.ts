'use server';

import { analyzePlantForProblems, type AnalyzePlantOutput } from '@/ai/flows/analyze-plant-for-problems';

export { type AnalyzePlantOutput } from '@/ai/flows/analyze-plant-for-problems';

export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  if (!photoDataUri) {
    return { data: null, error: 'No se proporcionó ninguna foto.' };
  }

  try {
    const result = await analyzePlantForProblems({ photoDataUri });
    return { data: result, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Analysis failed:', errorMessage);
    return { data: null, error: 'No se pudo analizar la planta. Es posible que el modelo de IA no esté disponible. Por favor, inténtalo de nuevo más tarde.' };
  }
}
