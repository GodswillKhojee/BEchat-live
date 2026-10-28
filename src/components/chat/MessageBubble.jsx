import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Avatar from "../../common/Avatar";
import AttachmentList from "./AttachmentList";
import ReadReceipt from "./Readreceipt";
import { formatTime } from "../../utils/formatTime";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "😮", "🚀"];

function readByLabel(names) {
  return names.length <= 3 ? names.join(", ") : `${names.length} people`;
}

export default function MessageBubble({
  message,
  showAuthor,
  isChannel,
  isLastMine,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}) {
  const { mine } = message;
  const attachments = message.attachments ?? [];
  const readBy = message.readBy ?? [];
  const reactions = message.reactions ?? [];

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || "");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editText.trim()) {
      onEdit?.(message.id, editText);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      onDelete?.(message.id);
    }
  };

  const meta = (
    <span
      className={`inline-flex items-center gap-1 align-middle text-[9px] ${
        mine ? "text-[#d8c6e3]" : "text-[#a59cab]"
      }`}
    >
      {message.edited && <span className="italic font-normal">(edited)</span>}
      {formatTime(message.at)}
      {mine && <ReadReceipt status={message.status} />}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={`group relative flex items-end gap-2 ${
        mine ? "justify-end" : "justify-start"
      } ${showAuthor ? "mt-3" : "mt-1"}`}
    >
      {!mine && isChannel && (
        <div className="w-8 shrink-0">
          {showAuthor && <Avatar avatarId={message.avatar} className="h-8 w-8" />}
        </div>
      )}

      <div className="max-w-[85%] sm:max-w-[70%]">
        {showAuthor && !mine && isChannel && (
          <p className="mb-1 text-[10px] font-semibold text-[#7F5D99]">
            {message.author}
          </p>
        )}

        <div className="relative">
          <div
            className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[12px] leading-[1.7] shadow-xs ${
              mine
                ? "rounded-br-md bg-[#4C2365] text-white"
                : "rounded-bl-md border border-[#ece7f0] bg-white text-[#211b28]"
            }`}
          >
            {/* Reply Context Banner */}
            {message.replyTo && (
              <div
                className={`mb-1.5 flex items-center gap-1.5 rounded-lg px-2 py-1 text-[10px] leading-tight ${
                  mine
                    ? "bg-white/10 border-l-2 border-[#D5B9E8] text-white/90"
                    : "bg-[#f8f5fa] border-l-2 border-[#7F5D99] text-[#603b78]"
                }`}
              >
                <span className="font-bold">{message.replyTo.author}:</span>
                <span className="truncate italic">{message.replyTo.text}</span>
              </div>
            )}

            {attachments.length > 0 && (
              <AttachmentList attachments={attachments} mine={mine} />
            )}

            {isEditing ? (
              <form onSubmit={handleSaveEdit} className="mt-1">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full rounded-lg bg-white/10 p-2 text-[12px] text-white outline-none ring-1 ring-white/30"
                  rows={2}
                  autoFocus
                />
                <div className="mt-1.5 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditText(message.text || "");
                    }}
                    className="rounded-md bg-white/20 px-2 py-0.5 text-[10px] font-semibold hover:bg-white/30"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-md bg-white px-2 py-0.5 text-[10px] font-bold text-[#4C2365] hover:bg-[#faf8fc]"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : message.text ? (
              <>
                {message.text}
                <span className="ml-2">{meta}</span>
              </>
            ) : (
              <div className="mt-1 flex justify-end">{meta}</div>
            )}
          </div>

          {/* Floating Action Menu (Reply, React, Edit, Delete) */}
          <div
            className={`absolute -top-3.5 z-10 hidden items-center gap-0.5 rounded-full border border-[#e5dfe9] bg-white px-1.5 py-0.5 shadow-md transition-all group-hover:flex focus-within:flex ${
              mine ? "right-1" : "left-1"
            }`}
          >
            {/* Quick React Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                title="Add reaction"
                className="grid h-6 w-6 place-items-center rounded-full text-[11px] hover:bg-[#f0ebf4]"
              >
                😊
              </button>

              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className={`absolute bottom-full mb-1 flex gap-1 rounded-full border border-[#e5dfe9] bg-white p-1 shadow-lg ${
                      mine ? "right-0" : "left-0"
                    }`}
                  >
                    {QUICK_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          onToggleReaction?.(message.id, emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="grid h-6 w-6 place-items-center rounded-full text-xs hover:bg-[#f3ecf8]"
                      >
                        {emoji}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reply Button */}
            <button
              type="button"
              onClick={() => onReply?.(message)}
              title="Reply to message"
              className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-[#817989] hover:bg-[#f0ebf4] hover:text-[#4C2365]"
            >
              ↩
            </button>

            {/* Edit / Delete Buttons for own messages */}
            {mine && (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  title="Edit message"
                  className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-[#817989] hover:bg-[#f0ebf4] hover:text-[#4C2365]"
                >
                  ✎
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  title="Delete message"
                  className="grid h-6 w-6 place-items-center rounded-full text-[10px] text-[#817989] hover:bg-[#f0ebf4] hover:text-[#c0566b]"
                >
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Reaction Badges Row */}
        {reactions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {reactions.map((r) => {
              const hasMine = r.users?.includes("You");
              return (
                <button
                  key={r.emoji}
                  type="button"
                  onClick={() => onToggleReaction?.(message.id, r.emoji)}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold transition ${
                    hasMine
                      ? "border-[#4C2365] bg-[#f3ecf8] text-[#4C2365]"
                      : "border-[#e5dfe9] bg-white text-[#554c5d] hover:bg-[#faf8fc]"
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.count}</span>
                </button>
              );
            })}
          </div>
        )}

        {mine && isChannel && isLastMine && readBy.length > 0 && (
          <p className="mt-1 text-right text-[10px] text-[#a59cab]">
            Read by {readByLabel(readBy)}
          </p>
        )}
      </div>
    </motion.div>
  );
}