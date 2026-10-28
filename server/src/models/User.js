import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      select: false, // Never return in default queries
    },
    avatarUrl: {
      type: String,
      default: "male", // Preset ("male" | "female") or upload URL
    },
    status: {
      type: String,
      enum: ["active", "away", "dnd"],
      default: "active",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
    title: {
      type: String,
      trim: true,
      maxlength: [60, "Title cannot exceed 60 characters"],
      default: "",
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [240, "Bio cannot exceed 240 characters"],
      default: "",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

// Text search index for user search
userSchema.index({ name: "text", email: "text" });

/**
 * Compares candidate password against stored bcrypt hash.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) {
    throw new Error("Password hash not loaded for comparison.");
  }
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Hashes password using bcrypt with 12 salt rounds.
 */
userSchema.statics.hashPassword = async function (password) {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long.");
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
};

export const User = mongoose.model("User", userSchema);
