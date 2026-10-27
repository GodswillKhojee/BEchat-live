import { motion } from "motion/react";
import Avatar from "../../common/Avatar";
import { formatTime } from "../../utils/formatTime";

export default function MessageBubble({ message, showAuthor, isChannel }) {
  const { mine } = message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"} ${
        showAuthor ? "mt-3" : "mt-1"
      }`}
    >
      {!mine && isChannel && (
        <div className="w-8 shrink-0">
          {showAuthor && <Avatar avatarId={message.avatar} className="h-8 w-8" />}
        </div>
      )}

      <div className="max-w-[78%] sm:max-w-[65%]">
        {showAuthor && !mine && isChannel && (
          <p className="mb-1 text-[10px] font-semibold text-[#7F5D99]">
            {message.author}
          </p>
        )}

        <div
          className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[12px] leading-[1.7] ${
            mine
              ? "rounded-br-md bg-[#4C2365] text-white"
              : "rounded-bl-md border border-[#ece7f0] bg-white text-[#211b28]"
          }`}
        >
          {message.text}
          <span
            className={`ml-2 inline-block translate-y-[2px] text-[9px] ${
              mine ? "text-[#d8c6e3]" : "text-[#a59cab]"
            }`}
          >
            {formatTime(message.at)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}