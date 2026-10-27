import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import EmptyChat from "./EmptyChat";

export default function ChatWindow({ conversation, onBack, onSend, className = "" }) {
  return (
    <section
      aria-label="Chat"
      className={`min-h-0 min-w-0 flex-1 flex-col bg-[#faf8fc] ${className}`}
    >
      {conversation ? (
        <>
          <ChatHeader conversation={conversation} onBack={onBack} />
          <MessageList conversation={conversation} />
          <MessageInput
            key={conversation.id}
            placeholder={`Message ${
              conversation.type === "channel" ? "#" : ""
            }${conversation.name}`}
            onSend={onSend}
          />
        </>
      ) : (
        <EmptyChat />
      )}
    </section>
  );
}