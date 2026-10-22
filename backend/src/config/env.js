import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl:
    process.env.DATABASE_URL || 'postgres://clinica:clinica@localhost:5432/clinica',
  jwtSecret: process.env.JWT_SECRET || 'clinica-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',
  corsOrigin: process.env.CORS_ORIGIN || '',
}
