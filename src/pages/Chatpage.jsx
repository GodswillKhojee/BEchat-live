import useChat from "../hooks/useChat";
import { mockUser } from "../data/Mockuser";
import { Sidebar, ConversationList, ChatWindow } from "../components/chat";

export default function ChatPage() {
  const chat = useChat();
  const hasActive = Boolean(chat.active);

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[#faf8fc] font-sans text-[#211b28]">
      <Sidebar user={mockUser} />

      {/* On mobile show either the list or the chat; on md+ show both */}
      <ConversationList
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.selectConversation}
        query={chat.query}
        onQueryChange={chat.setQuery}
        filter={chat.filter}
        onFilterChange={chat.setFilter}
        user={mockUser}
        className={hasActive ? "hidden md:flex" : "flex"}
      />

      <ChatWindow
        conversation={chat.active}
        onBack={chat.closeConversation}
        onSend={chat.sendMessage}
        className={hasActive ? "flex" : "hidden md:flex"}
      />
    </main>
  );
}