import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// In Genkit v1, you configure plugins when you call `genkit()`.
// This is the simplest, most robust configuration for server-side Next.js usage.
// It relies on Next.js to properly load GEMINI_API_KEY into process.env.
export const ai = genkit({
  plugins: [googleAI()],
});
