
'use server';

import { identifyStrain, type IdentifyStrainOutput } from '@/ai/flows/identify-strain';

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
