/**
 * Checks if the Gemini API key is configured correctly in the environment variables.
 * It verifies that the key exists and is not the placeholder value.
 * @returns {boolean} True if the API key is configured, false otherwise.
 */
export function isApiKeyConfigured(): boolean {
    const key = process.env.GEMINI_API_KEY;
    // Check if the key exists, is not empty, and is not the default placeholder key.
    return !!key && key.trim().length > 0 && !key.startsWith('YOUR_API_KEY_HERE');
}
