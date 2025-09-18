import { z } from "zod";

export const env = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  INICIS_MID: z.string().optional(),
  INICIS_SIGNKEY: z.string().optional(),
  INICIS_RETURN_URL: z.string().url().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
}).parse(process.env);
