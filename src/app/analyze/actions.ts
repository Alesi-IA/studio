'use server';

import { analyzePlantForProblems, type AnalyzePlantOutput } from '@/ai/flows/analyze-plant-for-problems';

export async function handleAnalysis(photoDataUri: string): Promise<{ data: AnalyzePlantOutput | null; error: string | null }> {
  if (!photoDataUri) {
    return { data: null, error: 'No photo provided.' };
  }

  try {
    const result = await analyzePlantForProblems({ photoDataUri });
    return { data: result, error: null };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    console.error('Analysis failed:', errorMessage);
    return { data: null, error: 'Failed to analyze plant. The AI model may be unavailable. Please try again later.' };
  }
}
