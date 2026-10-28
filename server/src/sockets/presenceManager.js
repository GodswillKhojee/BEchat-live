import { User } from "../models/User.js";

// Map of userId string -> Set of socketIds
const activeUserSockets = new Map();

export const presenceManager = {
  addSocket(userId, socketId) {
    const idStr = userId.toString();
    if (!activeUserSockets.has(idStr)) {
      activeUserSockets.set(idStr, new Set());
    }
    activeUserSockets.get(idStr).add(socketId);
    return activeUserSockets.get(idStr).size === 1; // True if this was first connection
  },

  removeSocket(userId, socketId) {
    const idStr = userId.toString();
    if (!activeUserSockets.has(idStr)) return false;

    const sockets = activeUserSockets.get(idStr);
    sockets.delete(socketId);

    if (sockets.size === 0) {
      activeUserSockets.delete(idStr);
      return true; // True if user is now completely offline
    }
    return false;
  },

  isOnline(userId) {
    return activeUserSockets.has(userId.toString());
  },

  async setUserOffline(userId) {
    try {
      await User.findByIdAndUpdate(userId, {
        status: "away",
        lastSeenAt: new Date(),
      });
    } catch (err) {
      console.warn("[Presence] Failed to update user status on disconnect:", err.message);
    }
  },
};
