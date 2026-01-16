export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: +process.env.PORT || 8080,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  corsCredentials: process.env.CORS_CREDENTIALS === 'true',
});
