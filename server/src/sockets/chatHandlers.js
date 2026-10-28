import { Conversation } from "../models/Conversation.js";
import { Message } from "../models/Message.js";
import { presenceManager } from "./presenceManager.js";
import { SocketEvents } from "../constants/events.js";

export function registerChatHandlers(io, socket) {
  const user = socket.user;
  const userId = user._id.toString();

  // Track socket connection in presence manager
  const isFirstConnection = presenceManager.addSocket(userId, socket.id);
  if (isFirstConnection) {
    io.emit(SocketEvents.PRESENCE_CHANGED, {
      userId,
      status: "active",
      lastSeenAt: new Date(),
    });
  }

  // 1. Join Conversation Room with Authorization Check
  socket.on(SocketEvents.JOIN_CONVERSATION, async ({ conversationId }, ack) => {
    try {
      if (!conversationId) {
        return ack?.({ success: false, error: "conversationId is required" });
      }

      const isMember = await Conversation.exists({
        _id: conversationId,
        memberIds: user._id,
      });

      if (!isMember) {
        return ack?.({ success: false, error: "Access denied. You are not a member of this conversation." });
      }

      const room = `conversation:${conversationId}`;
      socket.join(room);
      ack?.({ success: true, room });
    } catch (err) {
      ack?.({ success: false, error: err.message });
    }
  });

  // 2. Leave Conversation Room
  socket.on(SocketEvents.LEAVE_CONVERSATION, ({ conversationId }, ack) => {
    if (conversationId) {
      socket.leave(`conversation:${conversationId}`);
      ack?.({ success: true });
    }
  });

  // 3. Send Real-Time Message with Idempotency Deduplication
  socket.on(SocketEvents.SEND_MESSAGE, async (payload, ack) => {
    try {
      const { conversationId, body, attachments = [], replyToId, clientTempId } = payload;

      if (!conversationId) {
        return ack?.({ success: false, error: "conversationId is required" });
      }

      // Check membership
      const conversation = await Conversation.findOne({
        _id: conversationId,
        memberIds: user._id,
      });

      if (!conversation) {
        return ack?.({ success: false, error: "Access denied. You are not a member of this conversation." });
      }

      // Idempotency: prevent duplicate insertion on retry
      if (clientTempId) {
        const existing = await Message.findOne({ conversationId, clientTempId })
          .populate("senderId", "name avatarUrl status")
          .populate({
            path: "replyToId",
            select: "body senderId",
            populate: { path: "senderId", select: "name" },
          });

        if (existing) {
          return ack?.({ success: true, message: existing, isDuplicate: true });
        }
      }

      const message = await Message.create({
        conversationId,
        senderId: user._id,
        body: (body || "").trim(),
        attachments,
        replyToId: replyToId || null,
        clientTempId: clientTempId || null,
        readBy: [{ user: user._id, readAt: new Date() }],
      });

      const populated = await Message.findById(message._id)
        .populate("senderId", "name avatarUrl status")
        .populate({
          path: "replyToId",
          select: "body senderId",
          populate: { path: "senderId", select: "name" },
        });

      // Update conversation preview
      conversation.lastMessageAt = message.createdAt;
      conversation.lastMessagePreview = {
        body: message.body || (message.attachments.length > 0 ? "Attachment" : ""),
        senderName: user.name,
        at: message.createdAt,
      };
      await conversation.save();

      const room = `conversation:${conversationId}`;
      // Broadcast to all room members (including sender or acknowledge sender)
      io.to(room).emit(SocketEvents.NEW_MESSAGE, populated);

      ack?.({ success: true, message: populated });
    } catch (err) {
      ack?.({ success: false, error: err.message });
    }
  });

  // 4. Typing Indicators
  socket.on(SocketEvents.START_TYPING, ({ conversationId }) => {
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit(SocketEvents.USER_TYPING, {
        conversationId,
        userId,
        userName: user.name,
        isTyping: true,
      });
    }
  });

  socket.on(SocketEvents.STOP_TYPING, ({ conversationId }) => {
    if (conversationId) {
      socket.to(`conversation:${conversationId}`).emit(SocketEvents.USER_TYPING, {
        conversationId,
        userId,
        userName: user.name,
        isTyping: false,
      });
    }
  });

  // 5. Read Receipts
  socket.on(SocketEvents.READ_MESSAGES, async ({ conversationId }, ack) => {
    try {
      if (!conversationId) return;

      const now = new Date();
      await Message.updateMany(
        {
          conversationId,
          deletedAt: null,
          "readBy.user": { $ne: user._id },
        },
        {
          $push: { readBy: { user: user._id, readAt: now } },
        }
      );

      socket.to(`conversation:${conversationId}`).emit(SocketEvents.READ_RECEIPT, {
        conversationId,
        userId,
        readAt: now,
      });

      ack?.({ success: true });
    } catch (err) {
      ack?.({ success: false, error: err.message });
    }
  });

  // 6. Handle Disconnect
  socket.on("disconnect", async () => {
    const isCompletelyOffline = presenceManager.removeSocket(userId, socket.id);
    if (isCompletelyOffline) {
      await presenceManager.setUserOffline(userId);
      io.emit(SocketEvents.PRESENCE_CHANGED, {
        userId,
        status: "away",
        lastSeenAt: new Date(),
      });
    }
  });
}
