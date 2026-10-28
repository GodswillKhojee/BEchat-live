import { User } from "../models/User.js";
import { signToken } from "../middleware/authMiddleware.js";
import { sendSuccess, AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || name.trim().length < 2) {
      return next(new AppError("Name must be at least 2 characters long.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return next(new AppError("Please provide a valid email address.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    if (!password || password.length < 8) {
      return next(new AppError("Password must be at least 8 characters long.", HttpStatus.BAD_REQUEST, "VALIDATION_ERROR"));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return next(new AppError("Email address is already registered.", HttpStatus.CONFLICT, "DUPLICATE_EMAIL"));
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    });

    const token = signToken(user);
    const safeUser = user.toJSON();

    return sendSuccess(res, { user: safeUser, token }, null, HttpStatus.CREATED);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required.", HttpStatus.BAD_REQUEST, "MISSING_CREDENTIALS"));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");

    if (!user) {
      return next(new AppError("Invalid email or password.", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError("Invalid email or password.", HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS"));
    }

    // Update lastSeenAt
    user.lastSeenAt = new Date();
    await user.save();

    const token = signToken(user);
    const safeUser = user.toJSON();

    return sendSuccess(res, { user: safeUser, token }, null, HttpStatus.OK);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res) {
  return sendSuccess(res, { user: req.user.toJSON() });
}

export async function logout(req, res) {
  return sendSuccess(res, { message: "Logged out successfully." });
}
