import { AnalyzePlantInputSchema, AnalyzePlantOutputSchema } from '@/app/ai/schemas';
import {z} from 'genkit';

export type AnalyzePlantInput = z.infer<typeof AnalyzePlantInputSchema>;
export type AnalyzePlantOutput = z.infer<typeof AnalyzePlantOutputSchema>;
