import useChat from "../hooks/useChat";
import { useUser } from "../hooks/useUser";
import { Sidebar, ConversationList, ChatWindow } from "../components/chat";

export default function ChatPage() {
  const chat = useChat();
  const { user } = useUser();
  const hasActive = Boolean(chat.active);

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[#faf8fc] font-sans text-[#211b28]">
      <Sidebar user={user} />

      {/* On mobile show either the list or the chat; on md+ show both */}
      <ConversationList
        conversations={chat.conversations}
        activeId={chat.activeId}
        onSelect={chat.selectConversation}
        query={chat.query}
        onQueryChange={chat.setQuery}
        filter={chat.filter}
        onFilterChange={chat.setFilter}
        onCreateConversation={chat.createConversation}
        user={user}
        className={hasActive ? "hidden md:flex" : "flex"}
      />

      <ChatWindow
        conversation={chat.active}
        messages={chat.activeMessages}
        onBack={chat.closeConversation}
        onSend={chat.sendMessage}
        onReply={chat.setReplyingTo}
        onEdit={chat.editMessage}
        onDelete={chat.deleteMessage}
        onToggleReaction={chat.toggleReaction}
        replyingTo={chat.replyingTo}
        onCancelReply={() => chat.setReplyingTo(null)}
        messageSearchQuery={chat.messageSearchQuery}
        onMessageSearchChange={chat.setMessageSearchQuery}
        className={hasActive ? "flex" : "hidden md:flex"}
      />
    </main>
  );
}