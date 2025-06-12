// Google Gemini Configuration
// To use the Recipe Finder feature, you need to:
// 1. Get an API key from https://aistudio.google.com/app/apikey
// 2. Create a .env file in the root directory
// 3. Add your API key as: VITE_GEMINI_API_KEY=your_api_key_here
// 4. Restart your development server

export const GEMINI_CONFIG = {
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.7,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
  },
};

// Note: Gemini API is free and has better CORS support than OpenAI
export const isGeminiConfigured = () => {
  return Boolean(GEMINI_CONFIG.apiKey);
}; 