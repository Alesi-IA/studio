import { IdentifyStrainInputSchema, IdentifyStrainOutputSchema } from '@/app/ai/schemas';
import {z} from 'genkit';

export type IdentifyStrainInput = z.infer<typeof IdentifyStrainInputSchema>;
export type IdentifyStrainOutput = z.infer<typeof IdentifyStrainOutputSchema>;
