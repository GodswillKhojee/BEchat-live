import { mockUser } from "../data/Mockuser";
import { mockConversations } from "../data/mockConversations";

const STORAGE_KEYS = {
  USER: "chatlive_user_profile",
  AUTH: "chatlive_auth_session",
  CONVERSATIONS: "chatlive_conversations_v1",
};

/**
 * Helper to safely parse JSON from localStorage with a fallback
 */
function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storageService] Failed to parse item for key "${key}":`, err);
    return fallback;
  }
}

/**
 * Helper to safely save JSON to localStorage
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[storageService] Failed to set item for key "${key}":`, err);
  }
}

/**
 * Normalizes message date strings back into native Date objects.
 */
function hydrateConversations(list) {
  if (!Array.isArray(list)) return [];
  return list.map((c) => ({
    ...c,
    messages: (c.messages || []).map((m) => ({
      ...m,
      at: m.at ? new Date(m.at) : new Date(),
      reactions: m.reactions || [],
      attachments: m.attachments || [],
      readBy: m.readBy || [],
      edited: Boolean(m.edited),
      editedAt: m.editedAt ? new Date(m.editedAt) : null,
    })),
  }));
}

// ----------------- Auth Session -----------------

export function getAuthSession() {
  const session = safeGet(STORAGE_KEYS.AUTH, null);
  if (!session || !session.isAuthenticated) {
    return { isAuthenticated: false, user: null };
  }
  return session;
}

export function saveAuthSession(sessionData) {
  safeSet(STORAGE_KEYS.AUTH, sessionData);
}

export function clearAuthSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  } catch (err) {
    console.warn("[storageService] Failed to clear auth session:", err);
  }
}

// ----------------- User Profile -----------------

export function getStoredUser() {
  const stored = safeGet(STORAGE_KEYS.USER, null);
  if (!stored) {
    safeSet(STORAGE_KEYS.USER, mockUser);
    return { ...mockUser };
  }
  return stored;
}

export function saveStoredUser(userData) {
  safeSet(STORAGE_KEYS.USER, userData);
}

export function resetStoredUser() {
  safeSet(STORAGE_KEYS.USER, mockUser);
  return { ...mockUser };
}

// ----------------- Conversations & Messages -----------------

export function getStoredConversations() {
  const rawList = safeGet(STORAGE_KEYS.CONVERSATIONS, null);
  if (!rawList || !Array.isArray(rawList) || rawList.length === 0) {
    const fresh = hydrateConversations(mockConversations);
    safeSet(STORAGE_KEYS.CONVERSATIONS, fresh);
    return fresh;
  }
  return hydrateConversations(rawList);
}

export function saveStoredConversations(conversations) {
  safeSet(STORAGE_KEYS.CONVERSATIONS, conversations);
}

export function resetStoredConversations() {
  const fresh = hydrateConversations(mockConversations);
  safeSet(STORAGE_KEYS.CONVERSATIONS, fresh);
  return fresh;
}

// ----------------- Master Reset -----------------

export function resetAllStorage() {
  try {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
  } catch (err) {
    console.warn("[storageService] Failed to reset storage:", err);
  }
  return {
    user: resetStoredUser(),
    conversations: resetStoredConversations(),
    session: { isAuthenticated: false, user: null },
  };
}
