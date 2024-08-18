export const EnvConfiguration = () => ({
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  port: +process.env.PORT || 8080,
});
