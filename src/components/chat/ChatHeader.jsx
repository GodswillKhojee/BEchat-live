import ConversationAvatar from "./ConversationAvatar";
import { statusOptions } from "../../constants/status";

export default function ChatHeader({ conversation, onBack }) {
  const isChannel = conversation.type === "channel";
  const status = statusOptions.find((s) => s.id === conversation.status);

  return (
    <header className="flex items-center gap-3 border-b border-[#ece7f0] bg-white px-3 py-3 sm:px-5">
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
        <h2 className="truncate font-dogica-pixel text-[11px] font-bold leading-[2.2] sm:text-[12px]">
          {isChannel ? `# ${conversation.name}` : conversation.name}
        </h2>
        <p className="truncate text-[10px] text-[#817989] sm:text-[11px]">
          {isChannel ? `${conversation.members} members` : status?.label}
        </p>
      </div>
    </header>
  );
}