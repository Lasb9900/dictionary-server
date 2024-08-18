import * as Joi from 'joi';

export const JoiValidationSchema = Joi.object({
  JWT_SECRET: Joi.required(),
  MONGODB_URI: Joi.required(),
  PORT: Joi.number().default(8080),
});
