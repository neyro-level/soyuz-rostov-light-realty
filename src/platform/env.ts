import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === undefined ? undefined : value;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  APP_ENV: z.enum(["local", "staging", "production"]).default("local"),
  INDEXING_MODE: z
    .enum(["private", "staging", "public"])
    .default("staging"),
  DATA_MODE: z.enum(["snapshot", "local"]).default("local"),
  LEADS_MODE: z.enum(["direct", "hub"]).default("direct"),
  LEAD_TRANSPORT: z.enum(["none", "smtp"]).default("none"),
  PROJECT_FIXTURE: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  MEDIA_ORIGIN: z.preprocess(emptyToUndefined, z.string().url().optional()),
  ANALYTICS_METRIKA_ID: z.preprocess(
    emptyToUndefined,
    z.string().min(1).optional(),
  ),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_PORT: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional(),
  ),
  SMTP_SECURE: z.preprocess(
    emptyToUndefined,
    z.enum(["true", "false"]).optional(),
  ),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  SMTP_FROM: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
});

export type AppEnv = Omit<z.infer<typeof envSchema>, "SMTP_SECURE"> & {
  SMTP_SECURE?: boolean;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.parse(source);
  if (parsed.LEAD_TRANSPORT === "smtp") {
    const required = [
      "SMTP_HOST",
      "SMTP_PORT",
      "SMTP_SECURE",
      "SMTP_USER",
      "SMTP_PASS",
      "SMTP_FROM",
    ] as const;
    for (const key of required) {
      if (parsed[key] === undefined) {
        throw new Error(`${key} is required when LEAD_TRANSPORT=smtp`);
      }
    }
  }
  return {
    ...parsed,
    SMTP_SECURE:
      parsed.SMTP_SECURE === undefined
        ? undefined
        : parsed.SMTP_SECURE === "true",
  };
}

export const env = loadEnv();
