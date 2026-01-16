import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  JWT_SECRET: Joi.required(),
  MONGODB_URI: Joi.required(),
  PORT: Joi.number().default(8080),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  AI_PROVIDER: Joi.string().valid('gemini', 'openai', 'ollama').default('ollama'),
  OPENAI_API_KEY: Joi.string().optional(),
  GEMINI_API_KEY: Joi.string().optional(),
  OLLAMA_BASE_URL: Joi.string().default('http://localhost:11434'),
  OLLAMA_MODEL: Joi.string().default('llama3.2:3b'),
  OLLAMA_TEMPERATURE: Joi.number().default(0.2),
  NEO4J_ENABLED: Joi.boolean().default(false),
  NEO4J_URI: Joi.string().optional(),
  NEO4J_USERNAME: Joi.string().optional(),
  NEO4J_PASSWORD: Joi.string().optional(),
  HEALTH_ENABLED: Joi.boolean().default(false),
});
