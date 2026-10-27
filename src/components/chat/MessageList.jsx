import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  conversation,
  messages,
  searchQuery = "",
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
}) {
  const endRef = useRef(null);
  const displayMessages = messages ?? conversation?.messages ?? [];
  const isChannel = conversation.type === "channel";
  const lastMineId = [...displayMessages].reverse().find((m) => m.mine)?.id;

  useEffect(() => {
    // Only auto-scroll to end if not searching through history
    if (!searchQuery.trim()) {
      endRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }
  }, [displayMessages.length, conversation?.id, searchQuery]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Messages"
      className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5"
    >
      {displayMessages.length === 0 && (
        <div className="py-12 text-center text-[12px] text-[#817989]">
          {searchQuery.trim() ? (
            <p>No messages matching &ldquo;{searchQuery.trim()}&rdquo; found in this conversation.</p>
          ) : (
            <p>No messages yet. Say hello to get started!</p>
          )}
        </div>
      )}

      {displayMessages.map((message, i) => (
        <MessageBubble
          key={message.id}
          message={message}
          isChannel={isChannel}
          isLastMine={message.id === lastMineId}
          showAuthor={displayMessages[i - 1]?.author !== message.author}
          onReply={onReply}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleReaction={onToggleReaction}
        />
      ))}

      <div ref={endRef} />
    </div>
  );
}