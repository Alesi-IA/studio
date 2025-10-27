'use server';

import { genkit, type GenkitErrorCode } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// Import flows here to ensure they are registered with Genkit
import '@/app/analyze/actions';
import '@/app/identify/actions';
import '@/ai/flows/assistant-chat-flow';


// In Genkit v1, you configure plugins when you call `genkit()`.
export const ai = genkit({
  plugins: [googleAI()],
  enableTracingAndMetrics: true,
});

function isApiKeyConfigured() {
    const key = process.env.GEMINI_API_KEY;
    return !!key && key.length > 0 && key !== 'AIzaSyC0s9umzyIGVi3yCPpaKCM7stWyQW3McZM';
}

export { isApiKeyConfigured };