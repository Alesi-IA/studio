import {z} from 'genkit';

// Common input schema for image-based analysis
export const ImageAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo of the cannabis plant, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // prettier-ignore
    ),
});

// Schema for Identify Strain feature
export const IdentifyStrainInputSchema = ImageAnalysisInputSchema;
export const IdentifyStrainOutputSchema = z.object({
  strainName: z.string().describe('El nombre identificado de la cepa de cannabis.'),
  potency: z.object({
    thc: z.number().min(0).max(100).describe('Porcentaje estimado de THC.'),
    cbd: z.number().min(0).max(100).describe('Porcentaje estimado de CBD.'),
    energy: z.number().min(0).max(100).describe('Un índice de 0 a 100 que indica el efecto energizante (0 para calmante, 100 para alta energía/hype).'),
  }),
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta (ej: "Ácaros", "Oídio", "Deficiencia de Nitrógeno"), en español.'),
});

// Schema for Analyze Plant Problems feature
export const AnalyzePlantInputSchema = ImageAnalysisInputSchema;
export const AnalyzePlantOutputSchema = z.object({
  problems: z
    .array(z.string())
    .describe('Una lista de posibles problemas identificados en la planta, en español.'),
  suggestions: z
    .array(z.string())
    .describe('Una lista de sugerencias para solucionar los problemas identificados, en español. Cada sugerencia debe ser un string con un título y una descripción separados por dos puntos, por ejemplo: "Título: Descripción detallada".'),
});
