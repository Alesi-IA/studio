
'use server';

import type { IdentifyStrainOutput } from './types';

export { type IdentifyStrainOutput } from './types';

const FEATURE_DISABLED_ERROR = "Esta función de IA requiere el plan de pago (Blaze) de Firebase. Por favor, actualiza tu proyecto para habilitarla.";


export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  // MODO DEMO SEGURO: Devuelve un error para evitar llamadas a la API que requieren un plan de pago.
  console.warn("Identification is in SAFE DEMO mode. Returning feature disabled error.");
  return new Promise(resolve => setTimeout(() => resolve({ data: null, error: FEATURE_DISABLED_ERROR }), 500));
}
