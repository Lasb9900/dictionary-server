export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: +process.env.PORT || 8080,
  aiProvider: process.env.AI_PROVIDER ?? 'gemini',
  aiTemperature: process.env.AI_TEMPERATURE
    ? Number(process.env.AI_TEMPERATURE)
    : 0,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL ?? 'llama3.1',
  ollamaEmbedModel: process.env.OLLAMA_EMBED_MODEL ?? 'nomic-embed-text',
  aiTestMode: process.env.AI_TEST_MODE === 'true',
});
