import { Conversation, generateDmKey } from "../models/Conversation.js";
import { User } from "../models/User.js";
import { sendSuccess, AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

export async function listConversations(req, res, next) {
  try {
    const conversations = await Conversation.find({
      memberIds: req.user._id,
    })
      .populate("memberIds", "name email avatarUrl status lastSeenAt")
      .populate("adminIds", "name email")
      .sort({ lastMessageAt: -1 });

    return sendSuccess(res, { conversations });
  } catch (err) {
    next(err);
  }
}

export async function createConversation(req, res, next) {
  try {
    const { type, name, recipientId, memberIds = [] } = req.body;

    if (!type || !["channel", "dm"].includes(type)) {
      return next(new AppError("Type must be either 'channel' or 'dm'.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    if (type === "dm") {
      if (!recipientId) {
        return next(new AppError("recipientId is required for direct messages.", HttpStatus.BAD_REQUEST, "MISSING_RECIPIENT"));
      }

      if (recipientId.toString() === req.user._id.toString()) {
        return next(new AppError("Cannot initiate a direct message conversation with yourself.", HttpStatus.BAD_REQUEST, "INVALID_RECIPIENT"));
      }

      const recipient = await User.findById(recipientId);
      if (!recipient) {
        return next(new AppError("Recipient user not found.", HttpStatus.NOT_FOUND, "RECIPIENT_NOT_FOUND"));
      }

      // Check if DM already exists using deterministic dmKey
      const dmKey = generateDmKey(req.user._id, recipientId);
      let existing = await Conversation.findOne({ dmKey })
        .populate("memberIds", "name email avatarUrl status lastSeenAt")
        .populate("adminIds", "name email");

      if (existing) {
        return sendSuccess(res, { conversation: existing, isExisting: true }, null, HttpStatus.OK);
      }

      const conversation = await Conversation.create({
        type: "dm",
        memberIds: [req.user._id, recipient._id],
        dmKey,
        name: recipient.name,
        lastMessagePreview: {
          body: "Direct message started.",
          senderName: req.user.name,
          at: new Date(),
        },
      });

      const populated = await Conversation.findById(conversation._id)
        .populate("memberIds", "name email avatarUrl status lastSeenAt")
        .populate("adminIds", "name email");

      return sendSuccess(res, { conversation: populated, isExisting: false }, null, HttpStatus.CREATED);
    }

    // Channel creation
    if (!name || name.trim().length === 0) {
      return next(new AppError("Channel name is required.", HttpStatus.BAD_REQUEST, "MISSING_CHANNEL_NAME"));
    }

    const cleanName = name.trim().replace(/^#\s*/, "");
    const uniqueMemberIds = Array.from(
      new Set([req.user._id.toString(), ...memberIds.map((id) => id.toString())])
    );

    const conversation = await Conversation.create({
      type: "channel",
      name: cleanName,
      memberIds: uniqueMemberIds,
      adminIds: [req.user._id],
      lastMessagePreview: {
        body: `Welcome to #${cleanName}!`,
        senderName: req.user.name,
        at: new Date(),
      },
    });

    const populated = await Conversation.findById(conversation._id)
      .populate("memberIds", "name email avatarUrl status lastSeenAt")
      .populate("adminIds", "name email");

    return sendSuccess(res, { conversation: populated }, null, HttpStatus.CREATED);
  } catch (err) {
    next(err);
  }
}

export async function getConversation(req, res) {
  // req.conversation is already verified by requireConversationMember
  const conversation = await Conversation.findById(req.conversation._id)
    .populate("memberIds", "name email avatarUrl status lastSeenAt")
    .populate("adminIds", "name email");

  return sendSuccess(res, { conversation });
}
