export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: +process.env.PORT || 8080,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
  aiProvider: process.env.AI_PROVIDER || 'ollama',
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2:3b',
  ollamaTemperature: +(process.env.OLLAMA_TEMPERATURE || 0.2),
  neo4jEnabled: process.env.NEO4J_ENABLED === 'true',
  healthEnabled: process.env.HEALTH_ENABLED === 'true',
});
