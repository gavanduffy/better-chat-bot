// OpenRouter models with file upload support
export const openrouterModels = [
  // Existing models...
  
  {
    id: 'openai/gpt-5-nano',
    name: '🧠 GPT-5 Nano',
    provider: 'openai',
    supportsFileUpload: true,  // ✅ File upload enabled
    supportsVision: true,
    supportsTools: true,
    contextLength: 128000,
    maxOutputTokens: 16000
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: '⚡ Gemini 2.5 Flash Lite',
    provider: 'google',
    supportsFileUpload: true,  // ✅ File upload enabled
    supportsVision: true,
    supportsTools: true,
    contextLength: 1000000,
    maxOutputTokens: 8192
  }
] as const;

export type OpenRouterModel = typeof openrouterModels[number];
