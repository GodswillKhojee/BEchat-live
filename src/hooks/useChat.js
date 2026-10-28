import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getStoredConversations,
  resetStoredConversations,
  saveStoredConversations,
} from "../services/storageService";
import { scheduleMockReceipts } from "../utils/mockReceipts";

const lastOf = (conversation) =>
  conversation?.messages?.[conversation.messages.length - 1];

export default function useChat() {
  const [conversations, setConversations] = useState(() => getStoredConversations());
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "channel" | "dm"
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");

  const timersRef = useRef([]);
  const latestRef = useRef(conversations);

  useEffect(() => {
    latestRef.current = conversations;
    saveStoredConversations(conversations);
  }, [conversations]);

  // Clean up mock timers and blob URLs on unmount
  useEffect(
    () => () => {
      timersRef.current.forEach((cancel) => cancel());
      latestRef.current.forEach((c) =>
        c.messages.forEach((m) =>
          m.attachments?.forEach((a) => {
            if (a.url?.startsWith("blob:")) URL.revokeObjectURL(a.url);
          })
        )
      );
    },
    []
  );

  // Filter and sort conversations for the sidebar/list
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();

    return conversations
      .filter((c) => filter === "all" || c.type === filter)
      .filter((c) => {
        if (!q) return true;
        const lastMsg = lastOf(c);
        return (
          c.name.toLowerCase().includes(q) ||
          (lastMsg?.text?.toLowerCase().includes(q) ?? false) ||
          (lastMsg?.attachments?.some((a) => a.name?.toLowerCase().includes(q)) ?? false)
        );
      })
      .sort((a, b) => {
        const timeB = lastOf(b)?.at ? new Date(lastOf(b).at).getTime() : 0;
        const timeA = lastOf(a)?.at ? new Date(lastOf(a).at).getTime() : 0;
        return timeB - timeA;
      });
  }, [conversations, query, filter]);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) ?? null,
    [conversations, activeId]
  );

  // Active messages filtered by in-chat message search
  const activeMessages = useMemo(() => {
    if (!active) return [];
    const q = messageSearchQuery.trim().toLowerCase();
    if (!q) return active.messages;
    return active.messages.filter(
      (m) =>
        m.text?.toLowerCase().includes(q) ||
        m.attachments?.some((a) => a.name?.toLowerCase().includes(q))
    );
  }, [active, messageSearchQuery]);

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
    setReplyingTo(null);
    setMessageSearchQuery("");
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
    );
  };

  const closeConversation = () => {
    setActiveId(null);
    setReplyingTo(null);
    setMessageSearchQuery("");
  };

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
      replyTo: replyingTo
        ? {
            id: replyingTo.id,
            author: replyingTo.author,
            text: replyingTo.text ? replyingTo.text.slice(0, 80) : "Attachment",
          }
        : null,
      reactions: [],
      status: "sent",
      readBy: [],
      at: new Date(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c
      )
    );

    setReplyingTo(null);

    // MOCK: simulated delivery and read receipts
    timersRef.current.push(
      scheduleMockReceipts(active, (patch) =>
        patchMessage(conversationId, message.id, patch)
      )
    );
  };

  const editMessage = (messageId, newText) => {
    if (!active) return;
    const trimmed = newText.trim();
    if (!trimmed) return;

    patchMessage(active.id, messageId, {
      text: trimmed,
      edited: true,
      editedAt: new Date(),
    });
  };

  const deleteMessage = (messageId) => {
    if (!active) return;
    setConversations((prev) =>
      prev.map((c) =>
        c.id !== active.id
          ? c
          : {
              ...c,
              messages: c.messages.filter((m) => m.id !== messageId),
            }
      )
    );
  };

  const toggleReaction = (messageId, emoji) => {
    if (!active) return;
    const conversationId = active.id;

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;

        return {
          ...c,
          messages: c.messages.map((m) => {
            if (m.id !== messageId) return m;

            const existingReactions = m.reactions || [];
            const targetReaction = existingReactions.find((r) => r.emoji === emoji);

            let nextReactions;
            if (targetReaction) {
              const hasReacted = targetReaction.users?.includes("You");
              if (hasReacted) {
                const nextUsers = targetReaction.users.filter((u) => u !== "You");
                if (nextUsers.length === 0) {
                  nextReactions = existingReactions.filter((r) => r.emoji !== emoji);
                } else {
                  nextReactions = existingReactions.map((r) =>
                    r.emoji === emoji
                      ? { ...r, count: r.count - 1, users: nextUsers }
                      : r
                  );
                }
              } else {
                nextReactions = existingReactions.map((r) =>
                  r.emoji === emoji
                    ? { ...r, count: r.count + 1, users: [...r.users, "You"] }
                    : r
                );
              }
            } else {
              nextReactions = [
                ...existingReactions,
                { emoji, count: 1, users: ["You"] },
              ];
            }

            return { ...m, reactions: nextReactions };
          }),
        };
      })
    );
  };

  const createConversation = ({ type, name, members = 1, avatar = "female", status = "active" }) => {
    const cleanName = name.trim().replace(/^#\s*/, "");
    if (!cleanName) return;

    const newConv = {
      id: `conv-${Date.now()}`,
      type,
      name: cleanName,
      members: type === "channel" ? members : undefined,
      participants: type === "channel" ? ["You", "Maya Chen"] : undefined,
      avatar: type === "dm" ? avatar : undefined,
      status: type === "dm" ? status : undefined,
      unread: 0,
      messages: [
        {
          id: `m-${Date.now()}-init`,
          mine: false,
          author: type === "channel" ? cleanName : cleanName,
          avatar: type === "dm" ? avatar : null,
          text:
            type === "channel"
              ? `Welcome to #${cleanName}! This channel is ready for collaboration.`
              : `Hey there! Connected on ChatLive.`,
          attachments: [],
          reactions: [],
          status: "read",
          readBy: [],
          at: new Date(),
        },
      ],
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    return newConv;
  };

  const resetAllChats = () => {
    const fresh = resetStoredConversations();
    setConversations(fresh);
    setActiveId(null);
  };

  return {
    conversations: visible,
    active,
    activeId,
    activeMessages,
    query,
    setQuery,
    filter,
    setFilter,
    replyingTo,
    setReplyingTo,
    messageSearchQuery,
    setMessageSearchQuery,
    selectConversation,
    closeConversation,
    sendMessage,
    editMessage,
    deleteMessage,
    toggleReaction,
    createConversation,
    resetAllChats,
  };
}