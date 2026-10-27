import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

export default function ChatWindow({
  conversation,
  messages,
  onBack,
  onSend,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  replyingTo,
  onCancelReply,
  messageSearchQuery,
  onMessageSearchChange,
  className = "",
}) {
  return (
    <section
      aria-label="Chat"
      className={`min-h-0 min-w-0 flex-1 flex-col bg-[#faf8fc] ${className}`}
    >
      {conversation ? (
        <>
          <ChatHeader
            conversation={conversation}
            onBack={onBack}
            messageSearchQuery={messageSearchQuery}
            onMessageSearchChange={onMessageSearchChange}
          />
          <MessageList
            conversation={conversation}
            messages={messages}
            searchQuery={messageSearchQuery}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleReaction={onToggleReaction}
          />
          <MessageInput
            key={conversation.id}
            placeholder={`Message ${
              conversation.type === "channel" ? "#" : ""
            }${conversation.name}`}
            onSend={onSend}
            replyingTo={replyingTo}
            onCancelReply={onCancelReply}
          />
        </>
      ) : (
        <EmptyChat />
      )}
    </section>
  );
}