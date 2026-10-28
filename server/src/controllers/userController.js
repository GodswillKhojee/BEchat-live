import { User } from "../models/User.js";
import { sendSuccess, AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

export async function getUsers(req, res, next) {
  try {
    const q = req.query.q?.trim();
    const query = {
      _id: { $ne: req.user._id },
    };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const users = await User.find(query).limit(50).sort({ name: 1 });
    return sendSuccess(res, { users });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, title, bio, timezone, avatarUrl } = req.body;
    const user = req.user;

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return next(new AppError("Name must be at least 2 characters long.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
      }
      user.name = name.trim();
    }

    if (title !== undefined) {
      user.title = (title || "").slice(0, 60).trim();
    }

    if (bio !== undefined) {
      user.bio = (bio || "").slice(0, 240).trim();
    }

    if (timezone !== undefined) {
      user.timezone = timezone || "UTC";
    }

    if (avatarUrl !== undefined) {
      user.avatarUrl = avatarUrl;
    }

    await user.save();
    return sendSuccess(res, { user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { status } = req.body;
    const allowed = ["active", "away", "dnd"];

    if (!allowed.includes(status)) {
      return next(new AppError("Invalid status value. Choose active, away, or dnd.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    req.user.status = status;
    req.user.lastSeenAt = new Date();
    await req.user.save();

    return sendSuccess(res, { user: req.user.toJSON() });
  } catch (err) {
    next(err);
  }
}
