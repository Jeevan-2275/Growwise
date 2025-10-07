import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  
  // NextAuth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  
  // External APIs
  MFAPI_BASE_URL: z.string().url().default('https://api.mfapi.in'),
  GEMINI_API_KEY: z.string(),
  
  // App Config
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
})

export const env = envSchema.parse(process.env)

export type Env = z.infer<typeof envSchema>
