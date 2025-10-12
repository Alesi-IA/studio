'use server';
/**
 * @fileOverview AI-powered tool for analyzing cannabis plant photos to identify potential problems.
 *
 * - analyzePlantForProblems - Analyzes a plant photo for nutrient deficiencies, pests, or diseases.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzePlantInputSchema, AnalyzePlantOutputSchema } from '@/app/analyze/types';
import type { AnalyzePlantInput, AnalyzePlantOutput } from '@/app/analyze/types';


export async function analyzePlantForProblems(
  input: AnalyzePlantInput
): Promise<AnalyzePlantOutput> {
  return analyzePlantForProblemsFlow(input);
}

const analyzePlantForProblemsFlow = ai.defineFlow(
  {
    name: 'analyzePlantForProblemsFlow',
    inputSchema: AnalyzePlantInputSchema,
    outputSchema: AnalyzePlantOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: [
        { text: `Eres un experto en la salud de plantas de cannabis. Analiza la imagen proporcionada de una planta de cannabis en busca de posibles problemas, como deficiencias de nutrientes, plagas o enfermedades. Proporciona una lista de los problemas identificados y sugerencias para solucionarlos.

TODA tu respuesta debe ser en español.

Responde en formato JSON.` },
        { media: { url: input.photoDataUri } },
      ],
      output: {
        format: 'json',
        schema: AnalyzePlantOutputSchema,
      },
    });

    return output!;
  }
);
