import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { mockConversations } from "../data/mockConversations";
import { scheduleMockReceipts } from "../utils/mockReceipts";

const lastOf = (conversation) =>
  conversation.messages[conversation.messages.length - 1];

// All chat state lives here. Swap the setters for API calls and
// Socket.IO events when the backend exists.
export default function useChat(initial = mockConversations) {
  const [conversations, setConversations] = useState(initial);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "channel" | "dm"

  const timersRef = useRef([]);
  const latestRef = useRef(conversations);

  useEffect(() => {
    latestRef.current = conversations;
  }, [conversations]);

  // On leaving the page: stop mock timers and free attachment URLs
  useEffect(
    () => () => {
      timersRef.current.forEach((cancel) => cancel());
      latestRef.current.forEach((c) =>
        c.messages.forEach((m) =>
          m.attachments?.forEach((a) => {
            if (a.url.startsWith("blob:")) URL.revokeObjectURL(a.url);
          })
        )
      );
    },
    []
  );

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

  const patchMessage = useCallback((conversationId, messageId, patch) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id !== conversationId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, ...patch } : m
              ),
            }
      )
    );
  }, []);

  const selectConversation = (id) => {
    setActiveId(id);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const closeConversation = () => setActiveId(null);

  const sendMessage = (text, attachments = []) => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || !active) return;

    const conversationId = active.id;
    const message = {
      id: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      mine: true,
      author: "You",
      avatar: null,
      text: trimmed,
      attachments, // [{ id, name, size, type, url }]
      status: "sent",
      readBy: [],
      at: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
      )
    );

    // MOCK: replace with socket.emit("message:send", ...) and real receipt events.
    timersRef.current.push(
      scheduleMockReceipts(active, (patch) =>
        patchMessage(conversationId, message.id, patch)
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