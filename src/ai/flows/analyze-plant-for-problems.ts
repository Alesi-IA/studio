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
    .describe('A list of potential problems identified in the plant.'),
  suggestions: z
    .array(z.string())
    .describe('A list of suggestions for addressing the identified problems.'),
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
  prompt: `You are an expert in cannabis plant health. Analyze the provided image of a cannabis plant for potential problems, such as nutrient deficiencies, pests, or diseases. Provide a list of identified problems and suggestions for addressing them.

Plant Photo: {{media url=photoDataUri}}

Respond in JSON format.
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
