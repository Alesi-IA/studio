'use server';

import { identifyStrain } from '@/ai/flows/identify-strain';
import type { IdentifyStrainOutput } from './types';
import { IdentifyStrainInputSchema } from '@/app/ai/schemas';

export { type IdentifyStrainOutput } from './types';

export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  const validatedInput = IdentifyStrainInputSchema.safeParse({ photoDataUri });
  
  if (!validatedInput.success) {
    console.error('Validation failed:', validatedInput.error);
    return { data: null, error: 'La foto proporcionada no es válida.' };
  }

  try {
    const result = await identifyStrain(validatedInput.data);
    return { data: result, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error desconocido.';
    console.error('Identification failed:', errorMessage);
    return { data: null, error: 'No se pudo identificar la cepa. Es posible que el modelo de IA no esté disponible. Por favor, inténtalo de nuevo más tarde.' };
  }
}
