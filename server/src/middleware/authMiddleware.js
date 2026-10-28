import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";
import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

/**
 * Issues signed JWT for authenticated user.
 */
export function signToken(user) {
  const payload = {
    sub: user._id ? user._id.toString() : user.id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifies JWT token and attaches authenticated user to req.user.
 */
export async function authenticate(req, res, next) {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError("Authentication required. Please provide a Bearer token.", HttpStatus.UNAUTHORIZED, "UNAUTHORIZED"));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new AppError("User account belonging to this token no longer exists.", HttpStatus.UNAUTHORIZED, "USER_NOT_FOUND"));
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Authorization guard: verifies user is an active member of target conversation.
 */
export async function requireConversationMember(req, res, next) {
  try {
    const convId = req.params.conversationId || req.params.id;

    if (!convId) {
      return next(new AppError("Conversation identifier is required.", HttpStatus.BAD_REQUEST, "MISSING_ID"));
    }

    const conversation = await Conversation.findById(convId);
    if (!conversation) {
      return next(new AppError("Conversation not found.", HttpStatus.NOT_FOUND, "CONVERSATION_NOT_FOUND"));
    }

    const isMember = conversation.memberIds.some((id) => id.toString() === req.user._id.toString());
    if (!isMember) {
      return next(new AppError("Access denied. You are not a member of this conversation.", HttpStatus.FORBIDDEN, "FORBIDDEN"));
    }

    req.conversation = conversation;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Authorization guard: verifies user is author of message (or channel admin for deletion).
 */
export async function requireMessageAuthor(req, res, next) {
  try {
    const messageId = req.params.id;

    if (!messageId) {
      return next(new AppError("Message identifier is required.", HttpStatus.BAD_REQUEST, "MISSING_ID"));
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return next(new AppError("Message not found.", HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND"));
    }

    const isAuthor = message.senderId.toString() === req.user._id.toString();

    // Check if channel admin for deletion moderation
    let isChannelAdmin = false;
    if (req.method === "DELETE") {
      const conv = await Conversation.findById(message.conversationId);
      if (conv && conv.adminIds && conv.adminIds.some((id) => id.toString() === req.user._id.toString())) {
        isChannelAdmin = true;
      }
    }

    if (!isAuthor && !isChannelAdmin) {
      return next(new AppError("Permission denied. You can only modify your own messages.", HttpStatus.FORBIDDEN, "FORBIDDEN"));
    }

    req.message = message;
    next();
  } catch (err) {
    next(err);
  }
}
