
'use server';

import type { AnalyzePlantOutput } from './types';

export { type AnalyzePlantOutput } from './types';

const DEMO_ANALYSIS_DATA: AnalyzePlantOutput = {
  problems: [
    'Deficiencia de Calcio (Manchas marrones en hojas nuevas)',
    'Posible inicio de Araña Roja (Pequeños puntos blancos en el envés de las hojas)',
  ],
  suggestions: [
    'Ajustar pH del Agua: Asegúrate de que el pH de tu agua de riego esté entre 6.2 y 6.8. El calcio se absorbe mal fuera de este rango. Considera usar un suplemento de Calcio-Magnesio (Cal-Mag) en el próximo riego a mitad de dosis.',
    'Incrementar Humedad y Usar Aceite de Neem: La araña roja prospera en ambientes secos. Aumenta la humedad relativa si es posible. Aplica una solución de aceite de Neem en el envés de todas las hojas, preferiblemente justo antes de que se apaguen las luces para evitar quemaduras.',
  ],
};


export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  // SAFE DEMO MODE: Return structured demo data to showcase the UI.
  console.warn("Analysis is in SAFE DEMO mode. Returning demo data.");
  return new Promise(resolve => setTimeout(() => resolve({ data: DEMO_ANALYSIS_DATA, error: null }), 1500));
}
