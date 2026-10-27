import { useMemo, useState } from "react";
import { mockConversations } from "../data/mockConversations";

const lastOf = (conversation) =>
  conversation.messages[conversation.messages.length - 1];

// All chat state lives here. Swap the setters for API calls and
// Socket.IO events when the backend exists.
export default function useChat(initial = mockConversations) {
  const [conversations, setConversations] = useState(initial);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "channel" | "dm"

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return conversations
      .filter((c) => filter === "all" || c.type === filter)
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          (lastOf(c)?.text.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => (lastOf(b)?.at ?? 0) - (lastOf(a)?.at ?? 0));
  }, [conversations, query, filter]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  const selectConversation = (id) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const closeConversation = () => setActiveId(null);

  const sendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed || !activeId) return;

    const message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mine: true,
      author: "You",
      avatar: null,
      text: trimmed,
      at: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeId ? { ...c, messages: [...c.messages, message] } : c
      )
    );
  };

  return {
    conversations: visible,
    active,
    activeId,
    query,
    setQuery,
    filter,
    setFilter,
    selectConversation,
    closeConversation,
    sendMessage,
  };
}