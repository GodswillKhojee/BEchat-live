import { useState } from "react";
import ConversationAvatar from "./ConversationAvatar";
import { statusOptions } from "../../constants/status";

export default function ChatHeader({
  conversation,
  onBack,
  messageSearchQuery = "",
  onMessageSearchChange,
}) {
  const [showSearch, setShowSearch] = useState(false);
  const isChannel = conversation.type === "channel";
  const status = statusOptions.find((s) => s.id === conversation.status);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-[#ece7f0] bg-white px-3 py-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] border border-[#e6e0e9] text-[#554c5d] transition hover:border-[#C4A4DA] md:hidden"
        >
          <span aria-hidden="true">←</span>
        </button>

        <ConversationAvatar conversation={conversation} className="h-10 w-10" />

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="truncate font-dogica-pixel text-[11px] font-bold leading-[2.2] sm:text-[12px]">
              {isChannel ? `# ${conversation.name}` : conversation.name}
            </h2>
            <span className="hidden rounded-full bg-[#f3ecf8] px-2 py-0.5 text-[9px] font-semibold text-[#7F5D99] sm:inline-block">
              {isChannel ? "Channel" : "Direct"}
            </span>
          </div>
          <p className="truncate text-[10px] text-[#817989] sm:text-[11px]">
            {isChannel
              ? `${conversation.members || conversation.participants?.length || 2} members`
              : status?.label || "Offline"}
          </p>
        </div>
      </div>

      {/* In-chat search action */}
      <div className="flex items-center gap-2">
        {showSearch ? (
          <div className="relative flex items-center">
            <input
              type="text"
              value={messageSearchQuery}
              onChange={(e) => onMessageSearchChange?.(e.target.value)}
              placeholder="Search in chat..."
              autoFocus
              className="h-8 w-36 rounded-lg border border-[#C4A4DA] bg-[#faf8fc] px-2.5 pr-7 text-[11px] text-[#211b28] outline-none focus:ring-2 focus:ring-[#9E7FB5]/20 sm:w-52"
            />
            <button
              type="button"
              onClick={() => {
                onMessageSearchChange?.("");
                setShowSearch(false);
              }}
              className="absolute right-2 text-[11px] text-[#817989] hover:text-[#4C2365]"
              aria-label="Close message search"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowSearch(true)}
            title="Search messages in this conversation"
            aria-label="Search messages"
            className="grid h-8 w-8 place-items-center rounded-lg border border-[#e6e0e9] text-[#7F5D99] transition hover:border-[#C4A4DA] hover:bg-[#faf8fc]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}