import { z } from "zod";

export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  SUPABASE_BUCKET_NAME: z.string().default("maemais-documents"),
  JWT_SECRET: z.string().min(16),
  MAIL_HOST: z.string().default("sandbox.smtp.mailtrap.io"),
  MAIL_PORT: z.coerce.number().default(2525),
  MAIL_USER: z.string(),
  MAIL_PASS: z.string(),
  MAIL_FROM: z.string().default("noreply@maemais.com"),
  PAGARME_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  DEFAULT_PAYMENT_GATEWAY: z.enum(["PAGARME", "STRIPE"]).default("PAGARME"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);

  if (!parsed.success) {
    console.error("Configuração de ambiente inválida:", parsed.error.format());
    throw new Error("Variáveis de ambiente inválidas ou ausentes.");
  }

  return parsed.data;
}
