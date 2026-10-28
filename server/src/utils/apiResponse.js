import { HttpStatus } from "../constants/httpStatus.js";

export class AppError extends Error {
  constructor(message, statusCode = HttpStatus.BAD_REQUEST, code = "BAD_REQUEST", details = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function sendSuccess(res, data, meta = null, statusCode = HttpStatus.OK) {
  const payload = {
    success: true,
    data,
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, message, code = "BAD_REQUEST", statusCode = HttpStatus.BAD_REQUEST, details = []) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
