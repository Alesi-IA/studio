'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { z } from 'zod';

// CRITICAL FIX: Removed `dotenv`. Next.js handles loading the .env file automatically.
// Calling config() here was redundant and causing issues in the server environment.

// In Genkit v1, you configure plugins when you call `genkit()`.
// This is the simplest, most robust configuration for server-side Next.js usage.
// It relies on Next.js to properly load GEMINI_API_KEY into process.env.
export const ai = genkit({
  plugins: [googleAI()],
});

/**
 * Checks if the Gemini API key is configured correctly in the environment variables.
 * It verifies that the key exists and is not the placeholder value.
 * @returns {boolean} True if the API key is configured, false otherwise.
 */
function isApiKeyConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    // Check if the key exists, is not empty, and is not the default placeholder key.
    return !!key && key.trim().length > 0 && !key.startsWith('YOUR_API_KEY_HERE');
}

export { isApiKeyConfigured };
