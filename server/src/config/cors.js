import cors from "cors";
import { env } from "./env.js";

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or curl/mobile requests without origin in dev
    if (!origin) return callback(null, true);

    const isAllowed = env.ALLOWED_ORIGINS.some((allowed) => {
      if (allowed === "*") return true;
      return origin === allowed || origin.startsWith(allowed);
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Error: Origin ${origin} not allowed by Access-Control-Allow-Origin`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

export const corsMiddleware = cors(corsOptions);
