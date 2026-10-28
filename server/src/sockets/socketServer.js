import { Server } from "socket.io";
import { corsOptions } from "../config/cors.js";
import { socketHandshakeAuth } from "./handshakeAuth.js";
import { registerChatHandlers } from "./chatHandlers.js";

export function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: corsOptions,
    pingTimeout: 30000,
    pingInterval: 25000,
  });

  // Apply handshake authentication
  io.use(socketHandshakeAuth);

  // Connection handler
  io.on("connection", (socket) => {
    registerChatHandlers(io, socket);
  });

  return io;
}
