import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  JWT_SECRET: Joi.required(),
  MONGODB_URI: Joi.string().required(),
  PORT: Joi.number().default(8080),
  AI_PROVIDER: Joi.string().valid('ollama', 'gemini').default('ollama'),
  AI_TEMPERATURE: Joi.number().default(0),
  GEMINI_API_KEY: Joi.string().optional(),
  GEMINI_MODEL: Joi.string().optional(),
  OLLAMA_BASE_URL: Joi.string().optional(),
  OLLAMA_MODEL: Joi.string().optional(),
  AI_TEST_MODE: Joi.boolean().optional(),
});
