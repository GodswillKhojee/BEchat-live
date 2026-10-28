import { io } from "socket.io-client";
import { getAuthToken } from "../api/apiClient.js";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

let socketInstance = null;

export function getSocket() {
  return socketInstance;
}

export function initSocket() {
  const token = getAuthToken();
  if (!token) {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
    return null;
  }

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  if (socketInstance) {
    socketInstance.disconnect();
  }

  socketInstance = io(SOCKET_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socketInstance.on("connect", () => {
    console.log("[Socket] Connected to real-time server with id:", socketInstance.id);
  });

  socketInstance.on("connect_error", (err) => {
    console.warn("[Socket] Real-time connection error:", err.message);
  });

  socketInstance.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
