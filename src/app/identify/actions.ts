
'use server';

import { identifyStrain } from '@/ai/flows/identify-strain';
import { z } from 'zod';

export const IdentifyStrainInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type IdentifyStrainInput = z.infer<typeof IdentifyStrainInputSchema>;

export const IdentifyStrainOutputSchema = z.object({
  strainName: z.string().describe('El nombre identificado de la cepa de cannabis.'),
  potency: z.object({
    thc: z.number().min(0).max(100).describe('Porcentaje estimado de THC.'),
    cbd: z.number().min(0).max(100).describe('Porcentaje estimado de CBD.'),
    energy: z.number().min(0).max(100).describe('Un índice de 0 a 100 que indica el efecto energizante (0 para calmante, 100 para alta energía/hype).'),
  }),
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta (ej: "Ácaros", "Oídio", "Deficiencia de Nitrógeno"), en español.'),
});
export type IdentifyStrainOutput = z.infer<typeof IdentifyStrainOutputSchema>;


export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  if (!photoDataUri) {
    return { data: null, error: 'No se proporcionó ninguna foto.' };
  }

  try {
    const result = await identifyStrain({ photoDataUri });
    return { data: result, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Identification failed:', errorMessage);
    return { data: null, error: 'No se pudo identificar la cepa. Es posible que el modelo de IA no esté disponible. Por favor, inténtalo de nuevo más tarde.' };
  }
}
