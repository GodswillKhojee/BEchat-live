import { useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../../common/Avatar";
import ConversationItem from "./ConversationItem";
import NewConversationModal from "./NewConversationModal";

const filters = [
  { id: "all", label: "All" },
  { id: "channel", label: "Channels" },
  { id: "dm", label: "Direct" },
];

export default function ConversationList({
  conversations,
  activeId,
  onSelect,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onCreateConversation,
  user,
  className = "",
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <aside
        aria-label="Conversations"
        className={`min-h-0 w-full shrink-0 flex-col border-r border-[#ece7f0] bg-white md:w-[320px] lg:w-[360px] ${className}`}
      >
        <div className="px-4 pb-3 pt-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h1 className="font-dogica-pixel text-[14px] font-bold leading-[2] sm:text-[16px]">
                Chats
              </h1>
              <span className="rounded-full bg-[#f0ebf4] px-2 py-0.5 text-[10px] font-bold text-[#7F5D99]">
                {conversations.length}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowModal(true)}
                title="Create new conversation"
                aria-label="Create new conversation"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-[#e6e0e9] bg-[#faf8fc] px-2.5 text-[11px] font-bold text-[#4C2365] transition hover:border-[#C4A4DA] hover:bg-white"
              >
                <span className="text-base leading-none" aria-hidden="true">+</span>
                <span>New</span>
              </button>

              {/* The sidebar is hidden on mobile, so link to the profile from here */}
              <Link
                to="/profile"
                aria-label="Your profile"
                className="md:hidden"
              >
                <Avatar
                  avatarId={user.avatar}
                  photo={user.photo}
                  status={user.status}
                  className="h-8 w-8"
                />
              </Link>
            </div>
          </div>

          <label htmlFor="conversation-search" className="sr-only">
            Search conversations
          </label>
          <input
            id="conversation-search"
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search conversations"
            autoComplete="off"
            className="mb-3 block w-full min-w-0 rounded-[10px] border border-[#e5dfe9] bg-white px-3.5 py-2.5 text-[12px] text-[#211b28] outline-none transition placeholder:text-[#b0a8b7] focus:border-[#9E7FB5] focus:ring-[3px] focus:ring-[#9E7FB5]/15"
          />

          <div className="grid grid-cols-3 rounded-xl bg-[#f0ebf4] p-1">
            {filters.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={filter === id}
                onClick={() => onFilterChange(id)}
                className={`min-h-[36px] rounded-[9px] px-2 text-[11px] font-semibold transition-all duration-200 ${
                  filter === id
                    ? "bg-white text-[#4C2365] shadow-xs"
                    : "text-[#817489] hover:text-[#4C2365]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {conversations.length ? (
          <ul className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                active={conversation.id === activeId}
                onSelect={() => onSelect(conversation.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="px-6 py-12 text-center text-[12px] leading-[1.8] text-[#817989]">
            <p className="font-semibold text-[#39313f]">
              {query.trim()
                ? `No conversations match "${query.trim()}".`
                : "No conversations found."}
            </p>
            <p className="mt-1 text-[11px]">
              {query.trim()
                ? "Try a different search term or clear the filter."
                : "Click '+ New' to create a channel or direct message."}
            </p>
          </div>
        )}
      </aside>

      <NewConversationModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={onCreateConversation}
      />
    </>
  );
}