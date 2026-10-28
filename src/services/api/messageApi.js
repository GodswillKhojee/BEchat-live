import { apiRequest } from "./apiClient.js";

export async function fetchMessages(conversationId, cursor = null, limit = 30) {
  const params = new URLSearchParams();
  if (cursor) params.append("cursor", cursor);
  if (limit) params.append("limit", limit.toString());

  const queryStr = params.toString() ? `?${params.toString()}` : "";
  const res = await apiRequest(`/conversations/${conversationId}/messages${queryStr}`, {
    method: "GET",
  });
  return res.data; // { messages, nextCursor, hasMore }
}

export async function postMessage(conversationId, { body, attachments = [], replyToId = null, clientTempId = null }) {
  const res = await apiRequest(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { body, attachments, replyToId, clientTempId },
  });
  return res.data?.message;
}

export async function patchMessage(messageId, body) {
  const res = await apiRequest(`/messages/${messageId}`, {
    method: "PATCH",
    body: { body },
  });
  return res.data?.message;
}

export async function deleteMessage(messageId) {
  const res = await apiRequest(`/messages/${messageId}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function searchConversationMessages(conversationId, query) {
  const res = await apiRequest(
    `/conversations/${conversationId}/messages/search?q=${encodeURIComponent(query)}`,
    { method: "GET" }
  );
  return res.data?.messages || [];
}

export async function toggleMessageReaction(messageId, emoji) {
  const res = await apiRequest(`/messages/${messageId}/reactions`, {
    method: "POST",
    body: { emoji },
  });
  return res.data?.message;
}

export async function markConversationRead(conversationId) {
  const res = await apiRequest(`/conversations/${conversationId}/read`, {
    method: "POST",
  });
  return res.data;
}
