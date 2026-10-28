import { HttpStatus } from "../constants/httpStatus.js";
import { AppError, sendError } from "../utils/apiResponse.js";
import { env } from "../config/env.js";

export function notFoundHandler(req, res, next) {
  next(new AppError(`Endpoint not found: ${req.method} ${req.originalUrl}`, HttpStatus.NOT_FOUND, "NOT_FOUND"));
}

export function errorHandler(err, req, res, next) {
  // Respect explicit AppError instances
  if (err instanceof AppError) {
    return sendError(res, err.message, err.code, err.statusCode, err.details);
  }

  // Handle Mongoose Validation Errors
  if (err.name === "ValidationError") {
    const details = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return sendError(res, "Validation failed", "VALIDATION_ERROR", HttpStatus.BAD_REQUEST, details);
  }

  // Handle Mongoose Duplicate Key (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || "field";
    const message = field === "email" ? "Email address is already registered." : `Duplicate value for ${field}.`;
    return sendError(res, message, "DUPLICATE_KEY_ERROR", HttpStatus.CONFLICT, [{ field, message }]);
  }

  // Handle Mongoose Invalid ObjectId CastError
  if (err.name === "CastError") {
    return sendError(res, `Invalid identifier format: ${err.value}`, "INVALID_ID", HttpStatus.BAD_REQUEST);
  }

  // Handle JWT Errors
  if (err.name === "JsonWebTokenError") {
    return sendError(res, "Invalid authentication token.", "INVALID_TOKEN", HttpStatus.UNAUTHORIZED);
  }
  if (err.name === "TokenExpiredError") {
    return sendError(res, "Authentication token has expired. Please log in again.", "TOKEN_EXPIRED", HttpStatus.UNAUTHORIZED);
  }

  // Log unexpected errors safely (no secrets logged)
  console.error("[ServerError]", {
    message: err.message,
    method: req.method,
    url: req.originalUrl,
    stack: env.NODE_ENV === "development" ? err.stack : undefined,
  });

  const message = env.NODE_ENV === "production" ? "An internal server error occurred." : err.message;
  return sendError(res, message, "INTERNAL_SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR);
}
