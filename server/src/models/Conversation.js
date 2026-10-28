import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["channel", "dm"],
        message: "Conversation type must be either 'channel' or 'dm'",
      },
      required: [true, "Conversation type is required"],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Conversation name cannot exceed 50 characters"],
      required: function () {
        return this.type === "channel";
      },
      default: "",
    },
    memberIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    adminIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Deterministic sorted key for DMs (e.g., "id1:id2") enforcing strict uniqueness
    dmKey: {
      type: String,
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessagePreview: {
      body: { type: String, default: "" },
      senderName: { type: String, default: "" },
      at: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.dmKey;
        return ret;
      },
    },
  }
);

// Helper to calculate canonical dmKey
export function generateDmKey(userAId, userBId) {
  const [first, second] = [userAId.toString(), userBId.toString()].sort();
  return `${first}:${second}`;
}

// Pre-save hook to populate dmKey for DMs
conversationSchema.pre("save", function (next) {
  if (this.type === "dm") {
    if (!this.memberIds || this.memberIds.length !== 2) {
      return next(new Error("Direct messages must have exactly two members."));
    }
    this.dmKey = generateDmKey(this.memberIds[0], this.memberIds[1]);
  } else {
    this.dmKey = null;
    if (!this.memberIds || this.memberIds.length === 0) {
      return next(new Error("Channels must have at least one member."));
    }
  }
  next();
});

// Indexes
// High-performance sort for conversation sidebar
conversationSchema.index({ memberIds: 1, lastMessageAt: -1 });

// Strict uniqueness on dmKey
conversationSchema.index(
  { dmKey: 1 },
  { unique: true, partialFilterExpression: { dmKey: { $type: "string" } } }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
