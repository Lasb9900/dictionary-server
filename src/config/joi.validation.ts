import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  JWT_SECRET: Joi.required(),
  MONGODB_URI: Joi.required(),
  PORT: Joi.number().default(8080),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  CORS_CREDENTIALS: Joi.boolean().default(false),
  AI_PROVIDER: Joi.string().valid('openai', 'gemini').default('gemini'),
  GEMINI_API_KEY: Joi.string().optional(),
  OPENAI_API_KEY: Joi.string().optional(),
  NEO4J_URI: Joi.string().optional(),
  NEO4J_USERNAME: Joi.string().optional(),
  NEO4J_PASSWORD: Joi.string().optional(),
});
