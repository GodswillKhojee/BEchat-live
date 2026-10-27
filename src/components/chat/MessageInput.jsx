import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { inputClass } from "../auth/FormField";

export default function MessageInput({ placeholder, onSend }) {
  const [text, setText] = useState("");
  const ref = useRef(null);

  // Grow with content, up to a maximum height
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    setText("");
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
      className="flex items-end gap-2 border-t border-[#ece7f0] bg-white px-3 py-3 sm:px-5"
    >
      <label htmlFor="message-input" className="sr-only">
        Message
      </label>
      <textarea
        id="message-input"
        ref={ref}
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
        disabled={!text.trim()}
        className="min-h-[48px] shrink-0 rounded-[10px] bg-[#4C2365] px-4 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors hover:bg-[#603579] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[13px]"
      >
        Send
      </motion.button>
    </form>
  );
}