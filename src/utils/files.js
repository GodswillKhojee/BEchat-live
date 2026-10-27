// Image types that are safe to preview inline. SVG is deliberately excluded:
// opening an SVG in its own tab can run scripts, so it is treated as a download.
const PREVIEWABLE_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
];

export const isPreviewableImage = (type) => PREVIEWABLE_IMAGE_TYPES.includes(type);

export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}