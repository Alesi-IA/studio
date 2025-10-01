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
import type { AnalyzePlantInput, AnalyzePlantOutput } from '@/app/analyze/actions';
import { AnalyzePlantInputSchema, AnalyzePlantOutputSchema } from '@/app/analyze/actions';


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
