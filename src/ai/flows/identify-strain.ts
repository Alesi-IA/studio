
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
  strainName: z.string().describe('The identified name of the cannabis strain.'),
  potency: z.object({
    thc: z.number().min(0).max(100).describe('Estimated THC percentage.'),
    cbd: z.number().min(0).max(100).describe('Estimated CBD percentage.'),
    energy: z.number().min(0).max(100).describe('An index from 0 to 100 indicating the energizing effect (0 for calming, 100 for high energy/hype).'),
  }),
  problems: z
    .array(z.string())
    .describe('A list of potential problems identified in the plant (e.g., "Mites", "Powdery Mildew", "Nitrogen Deficiency").'),
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
  prompt: `You are an expert in cannabis plant identification and health. Analyze the provided image of a cannabis plant.

1.  **Identify the Strain:** Determine the most likely strain of the plant.
2.  **Estimate Potency:** Provide an estimated percentage for THC and CBD. Also, provide an "energy" index from 0 (very calming) to 100 (very energizing/hype).
3.  **Detect Problems:** Analyze the plant for any visible signs of pests (like spider mites, gnats), diseases (like powdery mildew, bud rot), or nutrient deficiencies. List any problems you find.

Plant Photo: {{media url=photoDataUri}}

Respond in JSON format.
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
