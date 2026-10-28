/**
 * Encodes timestamp and ObjectId into an opaque Base64 URL-safe cursor string.
 */
export function encodeCursor(createdAt, id) {
  if (!createdAt || !id) return null;
  const timeStr = createdAt instanceof Date ? createdAt.toISOString() : new Date(createdAt).toISOString();
  const raw = `${timeStr}::${id.toString()}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

/**
 * Decodes an opaque Base64 URL-safe cursor string into timestamp and ObjectId.
 */
export function decodeCursor(cursorStr) {
  if (!cursorStr || typeof cursorStr !== "string") return null;
  try {
    const raw = Buffer.from(cursorStr, "base64url").toString("utf8");
    const [timeStr, idStr] = raw.split("::");
    if (!timeStr || !idStr) return null;

    const date = new Date(timeStr);
    if (isNaN(date.getTime())) return null;

    return {
      createdAt: date,
      id: idStr,
    };
  } catch {
    return null;
  }
}

/**
 * Builds MongoDB query condition for backward cursor pagination.
 */
export function buildCursorQuery(cursorStr) {
  if (!cursorStr) return {};

  const decoded = decodeCursor(cursorStr);
  if (!decoded) return {};

  return {
    $or: [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
    ],
  };
}
