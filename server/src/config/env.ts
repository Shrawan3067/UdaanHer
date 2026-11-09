import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables reliably from server/.env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform((v) => parseInt(v, 10))
    .default("5001"),
  CLIENT_URL: z.string().default("http://localhost:5173"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_URL_TEST: z.string().optional(),
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET must be at least 16 characters long"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("24h"),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  TRUST_NAME: z
    .string()
    .default("UdaanHer Women Welfare & Empowerment Charitable Trust (Bhopal)"),
  TRUST_ADDRESS: z
    .string()
    .default("Plot 14, Arera Hills, Bhopal, Madhya Pradesh - 462011"),
  TRUST_PAN: z.string().default("AAATC1234D"),
  TRUST_80G_REGISTRATION: z.string().default("CIT(E)/BPL/80G/2021-22/A-1089"),
  PDF_STORAGE_PROVIDER: z.string().default("local"),
  PDF_STORAGE_BUCKET: z.string().default("storage/receipts"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Environment configuration validation failed:");
  console.error(parsed.error.format());
  throw new Error("Invalid environment configuration");
}

export const env = parsed.data;
