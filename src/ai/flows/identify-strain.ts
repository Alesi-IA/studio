'use server';
/**
 * @fileOverview AI-powered tool for identifying cannabis strains and their properties.
 *
 * - identifyStrain - Analyzes a plant photo to identify its strain, potency, and potential health issues.
 */

import {ai} from '@/ai/genkit';
import { IdentifyStrainInputSchema, IdentifyStrainOutputSchema } from '@/app/ai/schemas';
import type { IdentifyStrainInput, IdentifyStrainOutput } from '@/app/identify/types';


export async function identifyStrain(
  input: IdentifyStrainInput
): Promise<IdentifyStrainOutput> {
  return identifyStrainFlow(input);
}


const identifyStrainFlow = ai.defineFlow(
  {
    name: 'identifyStrainFlow',
    inputSchema: IdentifyStrainInputSchema,
    outputSchema: IdentifyStrainOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: `Eres un experto en identificación y salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis.

1.  **Identifica la Cepa:** Determina la cepa más probable de la planta.
2.  **Estima la Potencia:** Proporciona un porcentaje estimado para THC y CBD. Además, proporciona un índice de "energía" de 0 (muy calmante) a 100 (muy energizante/hype).
3.  **Detecta Problemas:** Analiza la planta en busca de signos visibles de plagas (como arañas rojas, mosquitos de los hongos), enfermedades (como oídio, moho del cogollo) o deficiencias de nutrientes. Enumera cualquier problema que encuentres.

TODA tu respuesta debe ser en español.

Responde en formato JSON.` },
        { media: { url: input.photoDataUri } },
      ],
      output: {
        format: 'json',
        schema: IdentifyStrainOutputSchema,
      },
    });
    
    return output!;
  }
);
