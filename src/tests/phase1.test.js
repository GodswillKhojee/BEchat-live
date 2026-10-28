import test from "node:test";
import assert from "node:assert/strict";
import { formatFileSize, isPreviewableImage } from "../utils/files.js";
import { validateImageFile } from "../utils/imageFile.js";
import { formatListTime, formatTime } from "../utils/formatTime.js";

test("File utilities and security checks", () => {
  // Safe previewable image MIME types
  assert.equal(isPreviewableImage("image/png"), true);
  assert.equal(isPreviewableImage("image/jpeg"), true);
  assert.equal(isPreviewableImage("image/webp"), true);
  assert.equal(isPreviewableImage("image/gif"), true);

  // SVG must NOT be previewable inline to prevent XSS execution
  assert.equal(isPreviewableImage("image/svg+xml"), false);
  assert.equal(isPreviewableImage("application/pdf"), false);

  // File size formatting
  assert.equal(formatFileSize(500), "500 B");
  assert.equal(formatFileSize(2048), "2 KB");
  assert.equal(formatFileSize(5 * 1024 * 1024), "5.0 MB");
});

test("Image validation constraints", () => {
  // Valid file under 5MB
  const validFile = { type: "image/png", size: 1024 * 1024 };
  assert.equal(validateImageFile(validFile), "");

  // Oversized file (> 5MB)
  const oversizedFile = { type: "image/png", size: 6 * 1024 * 1024 };
  assert.match(validateImageFile(oversizedFile), /5 MB or smaller/);

  // Disallowed MIME type
  const badMimeFile = { type: "application/javascript", size: 1024 };
  assert.match(validateImageFile(badMimeFile), /Choose a JPG, PNG, WebP or GIF/);
});

test("Time formatting utilities", () => {
  const now = new Date();
  assert.ok(formatTime(now));
  assert.ok(formatListTime(now));

  // ISO date strings from localStorage
  const isoString = "2026-10-27T10:00:00.000Z";
  assert.ok(formatTime(isoString));
  assert.ok(formatListTime(isoString));

  // Timestamp numbers
  assert.ok(formatTime(Date.now()));
  assert.ok(formatListTime(Date.now()));

  // Fallback for null/undefined/invalid values without throwing
  assert.ok(formatTime(null));
  assert.ok(formatListTime("invalid-date-string"));

  const past = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  assert.ok(formatListTime(past));
});

