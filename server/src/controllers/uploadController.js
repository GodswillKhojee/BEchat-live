import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { env } from "../config/env.js";
import { sendSuccess, AppError } from "../utils/apiResponse.js";
import { HttpStatus } from "../constants/httpStatus.js";

// Ensure upload directory exists
if (!fs.existsSync(env.UPLOAD_DIR)) {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
  "text/plain",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
  ".pdf",
  ".txt",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, env.UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeHash = crypto.randomBytes(16).toString("hex");
    cb(null, `${Date.now()}-${safeHash}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();

  // Explicitly block SVGs to eliminate stored XSS execution in browsers
  if (file.mimetype.includes("svg") || ext === ".svg") {
    return cb(
      new AppError(
        "SVG files are strictly disallowed due to security restrictions.",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        "UNSAFE_FILE_TYPE"
      ),
      false
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype) || !ALLOWED_EXTENSIONS.has(ext)) {
    return cb(
      new AppError(
        `File type ${file.mimetype} is not supported. Supported: JPG, PNG, WebP, GIF, PDF, TXT.`,
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
        "UNSUPPORTED_MEDIA_TYPE"
      ),
      false
    );
  }

  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_BYTES, // 10MB
    files: 5,
  },
});

export function handleUpload(req, res, next) {
  if (!req.file && (!req.files || req.files.length === 0)) {
    return next(new AppError("No file uploaded.", HttpStatus.BAD_REQUEST, "MISSING_FILE"));
  }

  const files = req.files || [req.file];
  const fileData = files.map((f) => ({
    name: f.originalname,
    size: f.size,
    type: f.mimetype,
    url: `/uploads/${f.filename}`,
  }));

  return sendSuccess(res, { files: fileData }, null, HttpStatus.CREATED);
}
