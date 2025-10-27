'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { next } from '@genkit-ai/next';
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// In Genkit v1, you configure plugins when you call `genkit()`.
export const ai = genkit({
  plugins: [googleAI(), next({ dev: true })],
  enableTracingAndMetrics: true,
});

function isApiKeyConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return !!key && key.length > 0 && key !== 'AIzaSyC0s9umzyIGVi3yCPpaKCM7stWyQW3McZM';
}

export { isApiKeyConfigured };
