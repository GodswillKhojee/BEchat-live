import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from server/.env or root .env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const DEFAULT_JWT_SECRET = "chatlive_development_secret_key_minimum_32_characters_for_security";

export const env = {
  PORT: parseInt(process.env.PORT || "5001", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  ALLOWED_ORIGINS: (process.env.CLIENT_URL || "http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174")
    .split(",")
    .map((o) => o.trim()),
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/chatlive",
  JWT_SECRET: process.env.JWT_SECRET || DEFAULT_JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "1d",
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, "../../uploads"),
  MAX_FILE_SIZE_BYTES: parseInt(process.env.MAX_FILE_SIZE_BYTES || "10485760", 10), // 10MB
};

// Validate critical configuration on startup
export function validateEnv() {
  const errors = [];

  if (!env.MONGODB_URI) {
    errors.push("MONGODB_URI is required.");
  }

  if (env.NODE_ENV === "production") {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push("JWT_SECRET must be at least 32 characters long in production.");
    }
    if (process.env.JWT_SECRET === DEFAULT_JWT_SECRET) {
      errors.push("Default development JWT_SECRET cannot be used in production.");
    }
  }

  if (errors.length > 0) {
    console.error("Environment Configuration Error(s):");
    errors.forEach((err) => console.error(` - ${err}`));
    throw new Error(`Invalid environment configuration: ${errors.join("; ")}`);
  }
}
