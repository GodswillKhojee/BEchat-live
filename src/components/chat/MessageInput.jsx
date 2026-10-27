import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { inputClass } from "../../common/FormField";
import { formatFileSize, isPreviewableImage } from "../../utils/files";

// Frontend limits for now. Match these to your server / Cloudinary limits later.
const MAX_FILES = 5;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export default function MessageInput({ placeholder, onSend }) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState("");
  const textRef = useRef(null);
  const fileRef = useRef(null);
  const pendingRef = useRef([]);

  useEffect(() => {
    pendingRef.current = attachments;
  }, [attachments]);

  // Free preview URLs for files that were never sent
  useEffect(
    () => () => pendingRef.current.forEach((a) => URL.revokeObjectURL(a.url)),
    []
  );

  // Grow with content, up to a maximum height
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const canSend = Boolean(text.trim()) || attachments.length > 0;

  const onFiles = (e) => {
    const picked = Array.from(e.target.files ?? []);
    e.target.value = ""; // allow picking the same file again

    const next = [...attachments];
    let problem = "";

    for (const file of picked) {
      if (next.length >= MAX_FILES) {
        problem = `You can attach up to ${MAX_FILES} files per message.`;
        break;
      }
      if (file.size === 0) {
        problem = `${file.name} is empty.`;
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        problem = `${file.name} is larger than ${formatFileSize(MAX_FILE_BYTES)}.`;
        continue;
      }
      next.push({
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
      });
    }

    setAttachments(next);
    setError(problem);
  };

  const removeAttachment = (id) => {
    const target = attachments.find((a) => a.id === id);
    if (target) URL.revokeObjectURL(target.url);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setError("");
  };

  const submit = (e) => {
    e?.preventDefault();
    if (!canSend) return;
    onSend(text, attachments);
    setText("");
    setAttachments([]);
    setError("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={submit}
      className="border-t border-[#ece7f0] bg-white px-3 py-3 sm:px-5"
    >
      {error && (
        <p role="alert" className="mb-2 text-[11px] leading-5 text-[#c0566b]">
          {error}
        </p>
      )}

      {attachments.length > 0 && (
        <ul
          aria-label="Files ready to send"
          className="mb-2 flex gap-2 overflow-x-auto pb-1"
        >
          {attachments.map((file) => (
            <li
              key={file.id}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-[#e5dfe9] bg-[#faf8fc] py-1.5 pl-1.5 pr-2"
            >
              {isPreviewableImage(file.type) ? (
                <img
                  src={file.url}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#f0ebf4] text-[#7F5D99]">
                  <svg {...iconProps} className="h-4 w-4">
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                  </svg>
                </span>
              )}

              <span className="min-w-0">
                <span className="block max-w-[130px] truncate text-[11px] font-semibold text-[#39313f]">
                  {file.name}
                </span>
                <span className="block text-[10px] text-[#817989]">
                  {formatFileSize(file.size)}
                </span>
              </span>

              <button
                type="button"
                onClick={() => removeAttachment(file.id)}
                aria-label={`Remove ${file.name}`}
                className="grid h-6 w-6 place-items-center rounded-full text-[#817989] transition hover:bg-[#f0ebf4] hover:text-[#4C2365]"
              >
                <svg {...iconProps} className="h-3.5 w-3.5">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileRef}
          type="file"
          multiple
          onChange={onFiles}
          className="hidden"
          tabIndex={-1}
          aria-hidden="true"
        />

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Attach files"
          title="Attach files"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] border border-[#e6e0e9] bg-white text-[#7F5D99] transition hover:border-[#C4A4DA] hover:bg-[#fbf8fd]"
        >
          <svg {...iconProps} className="h-5 w-5">
            <path d="M21.4 11.1l-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" />
          </svg>
        </button>

        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <textarea
          id="message-input"
          ref={textRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          maxLength={2000}
          className={`${inputClass} max-h-32 resize-none`}
        />

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={!canSend}
          className="min-h-[48px] shrink-0 rounded-[10px] bg-[#4C2365] px-4 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors hover:bg-[#603579] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[13px]"
        >
          Send
        </motion.button>
      </div>
    </form>
  );
}