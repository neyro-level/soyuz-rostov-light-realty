import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  INDEXING_MODE: z.enum(["staging", "live"]).default("staging"),
  DATA_MODE: z.enum(["hub", "local"]).default("local"),
  LEADS_MODE: z.enum(["direct", "hub"]).default("direct"),
  MEDIA_ORIGIN: z.string().url().optional(),
  ANALYTICS_METRIKA_ID: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}

export const env = loadEnv();
