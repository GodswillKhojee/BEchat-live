import { apiRequest } from "./apiClient.js";

export async function fetchConversations() {
  const res = await apiRequest("/conversations", { method: "GET" });
  return res.data?.conversations || [];
}

export async function createConversation(payload) {
  const res = await apiRequest("/conversations", {
    method: "POST",
    body: payload,
  });
  return res.data?.conversation;
}

export async function fetchConversationById(id) {
  const res = await apiRequest(`/conversations/${id}`, { method: "GET" });
  return res.data?.conversation;
}
