import {z} from 'genkit';

export const AnalyzePlantInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});
export type AnalyzePlantInput = z.infer<typeof AnalyzePlantInputSchema>;

export const AnalyzePlantOutputSchema = z.object({
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta, en español.'),
  suggestions: z
    .array(z.string())
    .describe('Una lista de sugerencias para solucionar los problemas identificados, en español. Cada sugerencia debe ser un string con un título y una descripción separados por dos puntos, por ejemplo: "Título: Descripción detallada".'),
});
export type AnalyzePlantOutput = z.infer<typeof AnalyzePlantOutputSchema>;
