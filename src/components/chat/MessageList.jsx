import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function MessageList({ conversation }) {
  const endRef = useRef(null);
  const { messages } = conversation;
  const isChannel = conversation.type === "channel";
  const lastMineId = [...messages].reverse().find((m) => m.mine)?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, conversation.id]);

  return (
    <div
      role="log"
      aria-live="polite"
      aria-label="Messages"
      className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5"
    >
      {messages.length === 0 && (
        <p className="py-10 text-center text-[12px] text-[#817989]">
          No messages yet. Say hello!
        </p>
      )}

      {messages.map((message, i) => (
        <MessageBubble
          key={message.id}
          message={message}
          isChannel={isChannel}
          isLastMine={message.id === lastMineId}
          showAuthor={messages[i - 1]?.author !== message.author}
        />
      ))}

      <div ref={endRef} />
    </div>
  );
}