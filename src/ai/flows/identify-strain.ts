
'use server';
/**
 * @fileOverview AI-powered tool for identifying cannabis strains and their properties.
 *
 * - identifyStrain - Analyzes a plant photo to identify its strain, potency, and potential health issues.
 * - IdentifyStrainInput - The input type for the identifyStrain function.
 * - IdentifyStrainOutput - The return type for the identifyStrain function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyStrainInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type IdentifyStrainInput = z.infer<typeof IdentifyStrainInputSchema>;

const IdentifyStrainOutputSchema = z.object({
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


export async function identifyStrain(
  input: IdentifyStrainInput
): Promise<IdentifyStrainOutput> {
  return identifyStrainFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyStrainPrompt',
  input: {schema: IdentifyStrainInputSchema},
  output: {schema: IdentifyStrainOutputSchema},
  prompt: `Eres un experto en identificación y salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis.

1.  **Identifica la Cepa:** Determina la cepa más probable de la planta.
2.  **Estima la Potencia:** Proporciona un porcentaje estimado para THC y CBD. Además, proporciona un índice de "energía" de 0 (muy calmante) a 100 (muy energizante/hype).
3.  **Detecta Problemas:** Analiza la planta en busca de signos visibles de plagas (como arañas rojas, mosquitos de los hongos), enfermedades (como oídio, moho del cogollo) o deficiencias de nutrientes. Enumera cualquier problema que encuentres.

TODA tu respuesta debe ser en español.

Planta - Foto: {{media url=photoDataUri}}

Responde en formato JSON.
`,
});

const identifyStrainFlow = ai.defineFlow(
  {
    name: 'identifyStrainFlow',
    inputSchema: IdentifyStrainInputSchema,
    outputSchema: IdentifyStrainOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
