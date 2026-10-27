import ConversationAvatar from "./ConversationAvatar";
import { formatListTime } from "../../utils/formatTime";

function previewOf(conversation, last) {
  if (!last) return "No messages yet";
  if (last.mine) return `You: ${last.text}`;
  if (conversation.type === "channel") return `${last.author}: ${last.text}`;
  return last.text;
}

export default function ConversationItem({ conversation, active, onSelect }) {
  const last = conversation.messages[conversation.messages.length - 1];
  const title =
    conversation.type === "channel" ? `# ${conversation.name}` : conversation.name;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={active ? "true" : undefined}
        className={`flex w-full items-center gap-3 rounded-xl border-l-4 px-3 py-2.5 text-left transition ${
          active
            ? "border-[#4C2365] bg-[#f3ecf8]"
            : "border-transparent hover:bg-[#faf8fc]"
        }`}
      >
        <ConversationAvatar conversation={conversation} />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[12px] font-semibold text-[#211b28]">
              {title}
            </span>
            {last && (
              <span className="shrink-0 text-[10px] text-[#a59cab]">
                {formatListTime(last.at)}
              </span>
            )}
          </span>

          <span className="mt-0.5 flex items-center justify-between gap-2">
            <span
              className={`truncate text-[11px] ${
                conversation.unread > 0 ? "font-semibold text-[#39313f]" : "text-[#817989]"
              }`}
            >
              {previewOf(conversation, last)}
            </span>

            {conversation.unread > 0 && (
              <span
                aria-label={`${conversation.unread} unread messages`}
                className="grid h-[18px] min-w-[18px] shrink-0 place-items-center rounded-full bg-[#4C2365] px-1.5 text-[10px] font-bold text-white"
              >
                {conversation.unread}
              </span>
            )}
          </span>
        </span>
      </button>
    </li>
  );
}