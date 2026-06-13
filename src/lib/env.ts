import { z } from "zod";

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),

  // Better Auth (必填)
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url("BETTER_AUTH_URL must be a valid URL"),

  // Admin Authorization (必填)
  ADMIN_EMAILS: z
    .string()
    .min(1, "ADMIN_EMAILS must contain at least one email")
    .transform((s) =>
      s
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter((email) => email.length > 0)
    )
    .pipe(z.array(z.string().email("Invalid email format in ADMIN_EMAILS"))),

  // Cloudflare R2 Storage (开发环境可选，生产环境必填)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional().or(z.literal("")),

  // Inngest (开发环境可选，生产环境必填)
  INNGEST_EVENT_KEY: z.string().optional(),
  INNGEST_SIGNING_KEY: z.string().optional(),
  INNGEST_DEV: z
    .string()
    .optional()
    .transform((val) => val === "true"),

  // DeepSeek AI (开发环境可选，生产环境必填)
  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().optional().or(z.literal("")),

  // MiniMax AI (开发环境可选，生产环境必填)
  MINIMAX_API_KEY: z.string().optional(),
  MINIMAX_GROUP_ID: z.string().optional(),

  // Remotion (开发环境可选，生产环境必填)
  REMOTION_LICENSE_KEY: z.string().optional(),
});

type EnvSchemaType = z.infer<typeof envSchema>;

// 生产环境额外校验
const productionSchema = envSchema.refine(
  (data) => {
    // 只在真实生产环境（非构建时）检查
    if (data.NODE_ENV === "production" && process.env.NEXT_PHASE !== "phase-production-build") {
      return (
        !!data.R2_ACCOUNT_ID &&
        !!data.R2_ACCESS_KEY_ID &&
        !!data.R2_SECRET_ACCESS_KEY &&
        !!data.R2_BUCKET_NAME &&
        !!data.R2_PUBLIC_URL
      );
    }
    return true;
  },
  {
    message:
      "Production environment requires R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and R2_PUBLIC_URL",
  }
).refine(
  (data) => {
    // 只在真实生产环境（非构建时）检查
    if (data.NODE_ENV === "production" && !data.INNGEST_DEV && process.env.NEXT_PHASE !== "phase-production-build") {
      return !!data.INNGEST_EVENT_KEY && !!data.INNGEST_SIGNING_KEY;
    }
    return true;
  },
  {
    message: "Production environment requires INNGEST_EVENT_KEY and INNGEST_SIGNING_KEY when INNGEST_DEV is not true",
  }
);

// 解析环境变量
function parseEnv(): EnvSchemaType {
  try {
    const parsed = productionSchema.parse(process.env);
    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Environment validation failed:");
      error.issues.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
      throw new Error("Invalid environment variables");
    }
    throw error;
  }
}

export const env = parseEnv();

export type Env = typeof env;
