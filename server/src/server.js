import http from "http";
import { env, validateEnv } from "./config/env.js";
import { connectDB, disconnectDB } from "./config/db.js";
import { createApp } from "./app.js";
import { initSocketServer } from "./sockets/socketServer.js";

async function bootstrap() {
  try {
    // 1. Validate environment configuration
    validateEnv();

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Create Express app
    const app = createApp();

    // 4. Create HTTP Server
    const httpServer = http.createServer(app);

    // 5. Attach Socket.IO
    const io = initSocketServer(httpServer);
    app.set("io", io);

    // 6. Start listening
    httpServer.listen(env.PORT, () => {
      console.log(`[ChatLive Server] Listening on port ${env.PORT} (${env.NODE_ENV})`);
      console.log(`[ChatLive Server] Health Check: http://localhost:${env.PORT}/api/health`);
    });

    // 7. Graceful Shutdown Handlers
    const shutdown = async (signal) => {
      console.log(`\n[ChatLive Server] Received ${signal}. Shutting down gracefully...`);
      httpServer.close(async () => {
        console.log("[ChatLive Server] HTTP server closed.");
        await disconnectDB();
        process.exit(0);
      });

      // Force exit after 10 seconds if graceful shutdown stalls
      setTimeout(() => {
        console.error("[ChatLive Server] Forced shutdown after timeout.");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (err) {
    console.error("[ChatLive Server] Fatal startup failure:", err.message);
    process.exit(1);
  }
}

bootstrap();
