'use server';
/**
 * @fileOverview AI-powered tool for analyzing cannabis plant photos to identify potential problems.
 *
 * - analyzePlantForProblems - Analyzes a plant photo for nutrient deficiencies, pests, or diseases.
 * - AnalyzePlantInput - The input type for the analyzePlantForProblems function.
 * - AnalyzePlantOutput - The return type for the analyzePlantForProblems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzePlantInput = z.infer<typeof AnalyzePlantInputSchema>;

const AnalyzePlantOutputSchema = z.object({
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta, en español.'),
  suggestions: z
    .array(z.string())
    .describe('Una lista de sugerencias para solucionar los problemas identificados, en español. Cada sugerencia debe ser un string con un título y una descripción separados por dos puntos, por ejemplo: "Título: Descripción detallada".'),
});
export type AnalyzePlantOutput = z.infer<typeof AnalyzePlantOutputSchema>;

export async function analyzePlantForProblems(
  input: AnalyzePlantInput
): Promise<AnalyzePlantOutput> {
  return analyzePlantForProblemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePlantForProblemsPrompt',
  input: {schema: AnalyzePlantInputSchema},
  output: {schema: AnalyzePlantOutputSchema},
  prompt: `Eres un experto en la salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis en busca de posibles problemas, como deficiencias de nutrientes, plagas o enfermedades. Proporciona una lista de los problemas identificados y sugerencias para solucionarlos.

TODA tu respuesta debe ser en español.

Planta - Foto: {{media url=photoDataUri}}

Responde en formato JSON.
`,
});

const analyzePlantForProblemsFlow = ai.defineFlow(
  {
    name: 'analyzePlantForProblemsFlow',
    inputSchema: AnalyzePlantInputSchema,
    outputSchema: AnalyzePlantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
