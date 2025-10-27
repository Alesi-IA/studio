'use server';

import { genkit, type GenkitErrorCode } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// In Genkit v1, you configure plugins when you call `genkit()`.
export const ai = genkit({
  plugins: [googleAI()],
  enableTracingAndMetrics: true,
});

function isApiKeyConfigured() {
    return !!process.env.GEMINI_API_KEY;
}

export { isApiKeyConfigured };
