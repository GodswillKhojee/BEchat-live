import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

export async function socketHandshakeAuth(socket, next) {
  try {
    const rawAuth = socket.handshake.auth?.token || socket.handshake.headers?.authorization;

    if (!rawAuth) {
      return next(new Error("AUTHENTICATION_REQUIRED"));
    }

    const token = rawAuth.startsWith("Bearer ") ? rawAuth.slice(7).trim() : rawAuth.trim();
    if (!token) {
      return next(new Error("AUTHENTICATION_REQUIRED"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new Error("USER_NOT_FOUND"));
    }

    socket.user = user;
    next();
  } catch {
    next(new Error("INVALID_TOKEN"));
  }
}
