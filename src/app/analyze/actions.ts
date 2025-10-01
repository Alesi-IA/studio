'use server';

import { analyzePlantForProblems } from '@/ai/flows/analyze-plant-for-problems';
import { z } from 'zod';

export const AnalyzePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzePlantInput = z.infer<typeof AnalyzePlantInputSchema>;

export const AnalyzePlantOutputSchema = z.object({
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta, en español.'),
  suggestions: z
    .array(z.string())
    .describe('Una lista de sugerencias para solucionar los problemas identificados, en español. Cada sugerencia debe ser un string con un título y una descripción separados por dos puntos, por ejemplo: "Título: Descripción detallada".'),
});
export type AnalyzePlantOutput = z.infer<typeof AnalyzePlantOutputSchema>;


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
