import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { corsMiddleware } from "./config/cors.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import convRoutes from "./routes/convRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // Cross-Origin Resource Sharing
  app.use(corsMiddleware);

  // Request Body Parsers with sensible payload size limits
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Static File Serving for Uploaded Attachments
  app.use("/uploads", express.static(env.UPLOAD_DIR));

  // Health Check Endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      app: "ChatLive API",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      env: env.NODE_ENV,
    });
  });

  // REST API Routes
  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/conversations", convRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/upload", uploadRoutes);

  // Not Found & Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
