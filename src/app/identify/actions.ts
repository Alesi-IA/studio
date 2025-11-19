
'use server';

import type { IdentifyStrainOutput } from './types';

export { type IdentifyStrainOutput } from './types';

const DEMO_IDENTIFICATION_DATA: IdentifyStrainOutput = {
  strainName: 'Cosecha Dorada',
  potency: {
    thc: 22,
    cbd: 1,
    energy: 65,
  },
  problems: [
    'Puntas ligeramente quemadas (posible exceso de nutrientes)',
    'Hojas inferiores un poco amarillas (posible deficiencia de Nitrógeno)',
  ],
};

export async function handleStrainIdentification(photoDataUri: string): Promise<{ data: IdentifyStrainOutput | null; error: string | null }> {
  // SAFE DEMO MODE: Return structured demo data to showcase the UI.
  console.warn("Identification is in SAFE DEMO mode. Returning demo data.");
  return new Promise(resolve => setTimeout(() => resolve({ data: DEMO_IDENTIFICATION_DATA, error: null }), 1500));
}
