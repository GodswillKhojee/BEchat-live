import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    size: { type: Number, required: true, min: 0 },
    type: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const reactionSchema = new mongoose.Schema(
  {
    emoji: { type: String, required: true, trim: true },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { _id: false }
);

const readReceiptSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: [true, "conversationId is required"],
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "senderId is required"],
      index: true,
    },
    body: {
      type: String,
      trim: true,
      default: "",
      maxlength: [4000, "Message body cannot exceed 4000 characters"],
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
      validate: [
        (val) => val.length <= 5,
        "Cannot attach more than 5 files to a single message.",
      ],
    },
    replyToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    reactions: {
      type: [reactionSchema],
      default: [],
    },
    readBy: {
      type: [readReceiptSchema],
      default: [],
    },
    editedAt: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    clientTempId: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Custom validation: Message must have body text OR at least one attachment
messageSchema.pre("validate", function (next) {
  const hasText = this.body && this.body.trim().length > 0;
  const hasAttachments = Array.isArray(this.attachments) && this.attachments.length > 0;

  if (!hasText && !hasAttachments) {
    this.invalidate("body", "Message must contain either text content or at least one attachment.");
  }
  next();
});

// Indexes for high performance
// 1. Stable Compound Index for cursor pagination and reverse chronological history:
messageSchema.index({ conversationId: 1, createdAt: -1, _id: -1 });

// 2. Querying active non-deleted messages:
messageSchema.index({ conversationId: 1, deletedAt: 1, createdAt: -1 });

// 3. Text search within messages:
messageSchema.index({ body: "text" });

// 4. Client temporary ID idempotency lookup:
messageSchema.index(
  { conversationId: 1, clientTempId: 1 },
  { sparse: true }
);

export const Message = mongoose.model("Message", messageSchema);
