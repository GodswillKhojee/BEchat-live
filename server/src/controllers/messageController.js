import { Message } from "../models/Message.js";
import { Conversation } from "../models/Conversation.js";
import { buildCursorQuery, encodeCursor } from "../utils/cursorPagination.js";
import { sendSuccess, AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

export async function getMessages(req, res, next) {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit || "30", 10), 1), 100);
    const cursor = req.query.cursor;

    const query = {
      conversationId: req.conversation._id,
      deletedAt: null,
      ...buildCursorQuery(cursor),
    };

    // Fetch limit + 1 to detect if more pages exist
    const items = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit + 1)
      .populate("senderId", "name avatarUrl status")
      .populate({
        path: "replyToId",
        select: "body senderId",
        populate: { path: "senderId", select: "name" },
      });

    const hasMore = items.length > limit;
    const messages = hasMore ? items.slice(0, limit) : items;

    let nextCursor = null;
    if (hasMore && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      nextCursor = encodeCursor(lastMsg.createdAt, lastMsg._id);
    }

    return sendSuccess(res, { messages, nextCursor, hasMore });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { body, attachments = [], replyToId, clientTempId } = req.body;
    const conversationId = req.conversation._id;
    const senderId = req.user._id;

    // Idempotency check: if clientTempId already exists in this conversation, return existing message
    if (clientTempId) {
      const existing = await Message.findOne({ conversationId, clientTempId })
        .populate("senderId", "name avatarUrl status")
        .populate({
          path: "replyToId",
          select: "body senderId",
          populate: { path: "senderId", select: "name" },
        });

      if (existing) {
        return sendSuccess(res, { message: existing, isDuplicate: true }, null, HttpStatus.OK);
      }
    }

    // Validate replyTo reference if supplied
    let validatedReplyToId = null;
    if (replyToId) {
      const targetReply = await Message.findOne({
        _id: replyToId,
        conversationId,
        deletedAt: null,
      });
      if (targetReply) {
        validatedReplyToId = targetReply._id;
      }
    }

    const message = await Message.create({
      conversationId,
      senderId,
      body: (body || "").trim(),
      attachments,
      replyToId: validatedReplyToId,
      clientTempId: clientTempId || null,
      readBy: [{ user: senderId, readAt: new Date() }],
    });

    // Populate sender details for immediate display
    const populated = await Message.findById(message._id)
      .populate("senderId", "name avatarUrl status")
      .populate({
        path: "replyToId",
        select: "body senderId",
        populate: { path: "senderId", select: "name" },
      });

    // Update conversation lastMessageAt and preview
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageAt: message.createdAt,
      lastMessagePreview: {
        body: message.body || (message.attachments.length > 0 ? "Attachment" : ""),
        senderName: req.user.name,
        at: message.createdAt,
      },
    });

    // Broadcast to room if Socket.IO server is attached to req.app
    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId.toString()}`).emit("message:new", populated);
    }

    return sendSuccess(res, { message: populated }, null, HttpStatus.CREATED);
  } catch (err) {
    next(err);
  }
}

export async function editMessage(req, res, next) {
  try {
    const { body } = req.body;
    const message = req.message; // From requireMessageAuthor

    if (!body || body.trim().length === 0) {
      return next(new AppError("Message body cannot be empty.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    message.body = body.trim();
    message.editedAt = new Date();
    await message.save();

    const populated = await Message.findById(message._id)
      .populate("senderId", "name avatarUrl status")
      .populate({
        path: "replyToId",
        select: "body senderId",
        populate: { path: "senderId", select: "name" },
      });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversationId.toString()}`).emit("message:edited", populated);
    }

    return sendSuccess(res, { message: populated });
  } catch (err) {
    next(err);
  }
}

export async function deleteMessage(req, res, next) {
  try {
    const message = req.message; // From requireMessageAuthor

    // Soft delete preserves reply thread coherence
    message.deletedAt = new Date();
    message.body = "[This message was deleted]";
    message.attachments = [];
    await message.save();

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversationId.toString()}`).emit("message:deleted", {
        messageId: message._id.toString(),
        conversationId: message.conversationId.toString(),
      });
    }

    return sendSuccess(res, { messageId: message._id.toString(), deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function searchMessages(req, res, next) {
  try {
    const q = req.query.q?.trim();
    if (!q) {
      return sendSuccess(res, { messages: [] });
    }

    const messages = await Message.find({
      conversationId: req.conversation._id,
      deletedAt: null,
      $or: [
        { body: { $regex: q, $options: "i" } },
        { "attachments.name": { $regex: q, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("senderId", "name avatarUrl status");

    return sendSuccess(res, { messages });
  } catch (err) {
    next(err);
  }
}

export async function toggleReaction(req, res, next) {
  try {
    const { emoji } = req.body;
    const messageId = req.params.id;
    const userId = req.user._id;

    if (!emoji || typeof emoji !== "string") {
      return next(new AppError("Emoji string is required.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    const message = await Message.findById(messageId);
    if (!message || message.deletedAt) {
      return next(new AppError("Message not found.", HttpStatus.NOT_FOUND, "MESSAGE_NOT_FOUND"));
    }

    const conversation = await Conversation.findOne({
      _id: message.conversationId,
      memberIds: userId,
    });
    if (!conversation) {
      return next(new AppError("Access denied.", HttpStatus.FORBIDDEN, "FORBIDDEN"));
    }

    const reactionIndex = message.reactions.findIndex((r) => r.emoji === emoji);

    if (reactionIndex > -1) {
      const userIndex = message.reactions[reactionIndex].users.findIndex((u) => u.toString() === userId.toString());
      if (userIndex > -1) {
        // Remove user's reaction
        message.reactions[reactionIndex].users.splice(userIndex, 1);
        if (message.reactions[reactionIndex].users.length === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add user to reaction
        message.reactions[reactionIndex].users.push(userId);
      }
    } else {
      // Create new reaction
      message.reactions.push({ emoji, users: [userId] });
    }

    await message.save();

    const populated = await Message.findById(message._id)
      .populate("senderId", "name avatarUrl status")
      .populate({
        path: "replyToId",
        select: "body senderId",
        populate: { path: "senderId", select: "name" },
      });

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${message.conversationId.toString()}`).emit("reaction:update", {
        messageId: message._id.toString(),
        reactions: populated.reactions,
      });
    }

    return sendSuccess(res, { message: populated });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const conversationId = req.conversation._id;
    const userId = req.user._id;
    const now = new Date();

    await Message.updateMany(
      {
        conversationId,
        deletedAt: null,
        "readBy.user": { $ne: userId },
      },
      {
        $push: { readBy: { user: userId, readAt: now } },
      }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`conversation:${conversationId.toString()}`).emit("message:receipt", {
        conversationId: conversationId.toString(),
        userId: userId.toString(),
        readAt: now,
      });
    }

    return sendSuccess(res, { read: true, conversationId });
  } catch (err) {
    next(err);
  }
}
