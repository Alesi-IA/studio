'use server';
/**
 * @fileOverview AI-powered tool for analyzing cannabis plant photos to identify potential problems.
 *
 * - analyzePlantForProblems - Analyzes a plant photo for nutrient deficiencies, pests, or diseases.
 */

import {ai} from '@/ai/genkit';
import {
  AnalyzePlantInputSchema,
  AnalyzePlantOutputSchema,
} from '@/app/ai/schemas';
import type {
  AnalyzePlantInput,
  AnalyzePlantOutput,
} from '@/app/analyze/types';

// Export the primary function for the server action
export async function analyzePlantForProblems(
  input: AnalyzePlantInput
): Promise<AnalyzePlantOutput> {
  return analyzePlantForProblemsFlow(input);
}

// Define the structured prompt for Genkit
const analyzePlantPrompt = ai.definePrompt({
  name: 'analyzePlantForProblemsPrompt',
  input: {schema: AnalyzePlantInputSchema},
  output: {schema: AnalyzePlantOutputSchema},
  prompt: `Eres un experto en la salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis en busca de posibles problemas, como deficiencias de nutrientes, plagas o enfermedades. Proporciona una lista de los problemas identificados y sugerencias para solucionarlos.

TODA tu respuesta debe ser en español.

Responde en formato JSON.

{{media url=photoDataUri}}`,
});

// Define the Genkit flow that uses the prompt
const analyzePlantForProblemsFlow = ai.defineFlow(
  {
    name: 'analyzePlantForProblemsFlow',
    inputSchema: AnalyzePlantInputSchema,
    outputSchema: AnalyzePlantOutputSchema,
  },
  async input => {
    const {output} = await analyzePlantPrompt(input);
    return output!;
  }
);
