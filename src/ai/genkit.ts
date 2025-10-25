import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// In Genkit v1, you configure plugins when you call `genkit()`.
const ai = genkit({
  plugins: [googleAI()],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

function isApiKeyConfigured() {
    return !!process.env.GEMINI_API_KEY;
}

export { ai, isApiKeyConfigured };
