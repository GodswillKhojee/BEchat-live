import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getStoredConversations,
  resetStoredConversations,
  saveStoredConversations,
} from "../services/storageService";
import { scheduleMockReceipts } from "../utils/mockReceipts";
import { useUser } from "./useUser";
import {
  createConversation as createConversationApi,
  fetchConversations,
} from "../services/api/conversationApi";
import {
  deleteMessage as deleteMessageApi,
  fetchMessages,
  markConversationRead,
  patchMessage as patchMessageApi,
  postMessage,
  toggleMessageReaction,
} from "../services/api/messageApi";
import { getSocket } from "../services/socket/socketClient";

const lastOf = (conversation) =>
  conversation?.messages?.[conversation.messages.length - 1];

export function normalizeMessage(m, currentUserId) {
  const isMine =
    m.mine !== undefined
      ? Boolean(m.mine)
      : m.senderId?._id
      ? m.senderId._id.toString() === currentUserId?.toString()
      : m.senderId?.toString() === currentUserId?.toString();

  const authorName = isMine ? "You" : m.senderId?.name || m.author || "User";
  const authorAvatar = isMine ? null : m.senderId?.avatarUrl || m.avatar || "female";

  return {
    id: m._id ? m._id.toString() : m.id,
    mine: isMine,
    author: authorName,
    avatar: authorAvatar,
    text: m.body !== undefined ? m.body : m.text || "",
    at: m.createdAt ? new Date(m.createdAt) : m.at ? new Date(m.at) : new Date(),
    attachments: m.attachments || [],
    replyTo: m.replyToId
      ? {
          id: m.replyToId._id ? m.replyToId._id.toString() : m.replyToId.id || m.replyToId,
          author: m.replyToId.senderId?.name || "Member",
          text: (m.replyToId.body || "").slice(0, 80),
        }
      : m.replyTo || null,
    reactions: (m.reactions || []).map((r) => ({
      emoji: r.emoji,
      count: r.users ? r.users.length : r.count || 1,
      users: (r.users || []).map((u) =>
        u.toString() === currentUserId?.toString() || u === "You" ? "You" : u.name || "Member"
      ),
    })),
    status: (m.readBy || []).length > 1 ? "read" : m.status || "delivered",
    readBy: (m.readBy || []).map((r) => r.user?.name || "Member"),
    edited: Boolean(m.edited || m.editedAt),
    editedAt: m.editedAt ? new Date(m.editedAt) : null,
  };
}

export function normalizeConversation(c, currentUserId) {
  const isDm = c.type === "dm";
  const otherMember = isDm
    ? (c.memberIds || []).find(
        (m) => (m._id ? m._id.toString() : m.toString()) !== currentUserId?.toString()
      )
    : null;

  const displayName = isDm
    ? otherMember?.name || c.name || "Direct Message"
    : c.name?.replace(/^#\s*/, "") || "channel";

  const displayAvatar = isDm ? otherMember?.avatarUrl || c.avatar || "female" : undefined;
  const displayStatus = isDm ? otherMember?.status || c.status || "active" : undefined;

  return {
    id: c._id ? c._id.toString() : c.id,
    type: c.type,
    name: displayName,
    members: c.memberIds ? c.memberIds.length : c.members || 1,
    participants: (c.memberIds || []).map((m) => m.name || m.toString()),
    avatar: displayAvatar,
    status: displayStatus,
    unread: c.unread || 0,
    messages: (c.messages || []).map((m) => normalizeMessage(m, currentUserId)),
    lastMessageAt: c.lastMessageAt ? new Date(c.lastMessageAt) : new Date(),
  };
}

export default function useChat() {
  const { user, isDemo, isAuthenticated } = useUser();
  const currentUserId = user?._id || user?.id;

  const [conversations, setConversations] = useState(() =>
    isDemo || !isAuthenticated ? getStoredConversations() : []
  );
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all"); // "all" | "channel" | "dm"
  const [replyingTo, setReplyingTo] = useState(null);
  const [messageSearchQuery, setMessageSearchQuery] = useState("");

  const timersRef = useRef([]);
  const latestRef = useRef(conversations);

  // Sync to demo localStorage if in demo mode
  useEffect(() => {
    latestRef.current = conversations;
    if (isDemo) {
      saveStoredConversations(conversations);
    }
  }, [conversations, isDemo]);

  // Load conversations from backend when in live mode
  useEffect(() => {
    if (isAuthenticated && !isDemo) {
      let isCancelled = false;
      async function loadLiveConversations() {
        try {
          const liveList = await fetchConversations();
          if (!isCancelled) {
            const normalized = liveList.map((c) => normalizeConversation(c, currentUserId));
            setConversations(normalized);
            if (normalized.length > 0) {
              setActiveId((prev) => prev || normalized[0].id);
            }
          }
        } catch (err) {
          console.warn("[useChat] Failed to fetch live conversations:", err.message);
        }
      }
      loadLiveConversations();
      return () => {
        isCancelled = true;
      };
    }
  }, [isAuthenticated, isDemo, currentUserId]);

  // Socket.IO event listeners for live real-time sync
  useEffect(() => {
    if (isDemo || !isAuthenticated) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (rawMsg) => {
      const convId = rawMsg.conversationId?._id
        ? rawMsg.conversationId._id.toString()
        : rawMsg.conversationId?.toString();
      const normMsg = normalizeMessage(rawMsg, currentUserId);

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          // Avoid duplicate insertion if already added optimistically
          const exists = c.messages.some(
            (m) => m.id === normMsg.id || (rawMsg.clientTempId && m.id === rawMsg.clientTempId)
          );
          if (exists) {
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === normMsg.id || (rawMsg.clientTempId && m.id === rawMsg.clientTempId)
                  ? normMsg
                  : m
              ),
              lastMessageAt: normMsg.at,
            };
          }
          return {
            ...c,
            messages: [...c.messages, normMsg],
            lastMessageAt: normMsg.at,
          };
        })
      );
    };

    const handleEditedMessage = (rawMsg) => {
      const normMsg = normalizeMessage(rawMsg, currentUserId);
      const convId = rawMsg.conversationId?._id
        ? rawMsg.conversationId._id.toString()
        : rawMsg.conversationId?.toString();

      setConversations((prev) =>
        prev.map((c) =>
          c.id !== convId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) => (m.id === normMsg.id ? normMsg : m)),
              }
        )
      );
    };

    const handleDeletedMessage = ({ messageId, conversationId }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id !== conversationId
            ? c
            : {
                ...c,
                messages: c.messages.filter((m) => m.id !== messageId),
              }
        )
      );
    };

    const handleReactionUpdate = ({ messageId, reactions }) => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          messages: c.messages.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  reactions: (reactions || []).map((r) => ({
                    emoji: r.emoji,
                    count: r.users ? r.users.length : r.count || 1,
                    users: (r.users || []).map((u) =>
                      u.toString() === currentUserId?.toString() || u === "You" ? "You" : u.name || "Member"
                    ),
                  })),
                }
              : m
          ),
        }))
      );
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:edited", handleEditedMessage);
    socket.on("message:deleted", handleDeletedMessage);
    socket.on("reaction:update", handleReactionUpdate);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:edited", handleEditedMessage);
      socket.off("message:deleted", handleDeletedMessage);
      socket.off("reaction:update", handleReactionUpdate);
    };
  }, [isAuthenticated, isDemo, currentUserId]);

  // Clean up timers and blob URLs on unmount
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

  // In-chat message search filter
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
              messages: c.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
            }
      )
    );
  }, []);

  const selectConversation = useCallback(
    async (id) => {
      setActiveId(id);
      setReplyingTo(null);
      setMessageSearchQuery("");

      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c))
      );

      // In live backend mode: join socket room and fetch historical messages
      if (isAuthenticated && !isDemo) {
        const socket = getSocket();
        if (socket) {
          socket.emit("conversation:join", { conversationId: id });
        }
        try {
          const res = await fetchMessages(id);
          if (res?.messages) {
            const normalized = res.messages.map((m) => normalizeMessage(m, currentUserId));
            // Messages from API are newest first; reverse for bottom-up display
            const ordered = [...normalized].reverse();
            setConversations((prev) =>
              prev.map((c) => (c.id === id ? { ...c, messages: ordered } : c))
            );
          }
          await markConversationRead(id);
        } catch (err) {
          console.warn("[useChat] Failed to load messages for conversation:", err.message);
        }
      }
    },
    [isAuthenticated, isDemo, currentUserId]
  );

  const closeConversation = () => {
    setActiveId(null);
    setReplyingTo(null);
    setMessageSearchQuery("");
  };

  const sendMessage = async (text, attachments = []) => {
    const trimmed = text.trim();
    if ((!trimmed && attachments.length === 0) || !active) return;

    const conversationId = active.id;
    const clientTempId = `c_msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const optimisticMessage = {
      id: clientTempId,
      mine: true,
      author: "You",
      avatar: null,
      text: trimmed,
      attachments,
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

    // Optimistic UI update
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, messages: [...c.messages, optimisticMessage] } : c
      )
    );

    setReplyingTo(null);

    // Live mode: persist via API or Socket
    if (isAuthenticated && !isDemo) {
      try {
        const savedMessage = await postMessage(conversationId, {
          body: trimmed,
          attachments,
          replyToId: replyingTo?.id || null,
          clientTempId,
        });

        if (savedMessage) {
          const norm = normalizeMessage(savedMessage, currentUserId);
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    messages: c.messages.map((m) => (m.id === clientTempId ? norm : m)),
                  }
                : c
            )
          );
        }
      } catch (err) {
        console.error("[useChat] Failed to send live message:", err.message);
      }
    } else {
      // Demo mode: simulated mock receipts
      timersRef.current.push(
        scheduleMockReceipts(active, (patch) =>
          patchMessage(conversationId, optimisticMessage.id, patch)
        )
      );
    }
  };

  const editMessage = async (messageId, newText) => {
    if (!active) return;
    const trimmed = newText.trim();
    if (!trimmed) return;

    // Optimistic update
    patchMessage(active.id, messageId, {
      text: trimmed,
      edited: true,
      editedAt: new Date(),
    });

    if (isAuthenticated && !isDemo) {
      try {
        await patchMessageApi(messageId, trimmed);
      } catch (err) {
        console.warn("[useChat] Failed to edit message on server:", err.message);
      }
    }
  };

  const deleteMessage = async (messageId) => {
    if (!active) return;

    // Optimistic deletion
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

    if (isAuthenticated && !isDemo) {
      try {
        await deleteMessageApi(messageId);
      } catch (err) {
        console.warn("[useChat] Failed to delete message on server:", err.message);
      }
    }
  };

  const toggleReaction = async (messageId, emoji) => {
    if (!active) return;
    const conversationId = active.id;

    // Optimistic toggle
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
                    r.emoji === emoji ? { ...r, count: r.count - 1, users: nextUsers } : r
                  );
                }
              } else {
                nextReactions = existingReactions.map((r) =>
                  r.emoji === emoji ? { ...r, count: r.count + 1, users: [...r.users, "You"] } : r
                );
              }
            } else {
              nextReactions = [...existingReactions, { emoji, count: 1, users: ["You"] }];
            }

            return { ...m, reactions: nextReactions };
          }),
        };
      })
    );

    if (isAuthenticated && !isDemo) {
      try {
        await toggleMessageReaction(messageId, emoji);
      } catch (err) {
        console.warn("[useChat] Failed to toggle reaction on server:", err.message);
      }
    }
  };

  const createConversation = async ({
    type,
    name,
    members = 1,
    avatar = "female",
    status = "active",
    recipientId = null,
  }) => {
    const cleanName = name?.trim().replace(/^#\s*/, "");

    // Live mode: persist via API
    if (isAuthenticated && !isDemo) {
      try {
        const payload =
          type === "dm"
            ? { type: "dm", recipientId }
            : { type: "channel", name: cleanName };

        const saved = await createConversationApi(payload);
        if (saved) {
          const norm = normalizeConversation(saved, currentUserId);
          setConversations((prev) => [norm, ...prev.filter((c) => c.id !== norm.id)]);
          setActiveId(norm.id);
          return norm;
        }
      } catch (err) {
        console.warn("[useChat] Failed to create live conversation:", err.message);
      }
    }

    // Demo mode: local seed
    if (!cleanName && type !== "dm") return;

    const newConv = {
      id: `conv-${Date.now()}`,
      type,
      name: cleanName || "Direct Message",
      members: type === "channel" ? members : undefined,
      participants: type === "channel" ? ["You", "Maya Chen"] : undefined,
      avatar: type === "dm" ? avatar : undefined,
      status: type === "dm" ? status : undefined,
      unread: 0,
      messages: [
        {
          id: `m-${Date.now()}-init`,
          mine: false,
          author: cleanName || "New Teammate",
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