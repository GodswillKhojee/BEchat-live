import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import {
  clearAuthSession,
  getAuthSession,
  getStoredUser,
  resetAllStorage,
  saveAuthSession,
  saveStoredUser,
} from "../services/storageService";
import { getMe, loginUser, logoutUser, registerUser } from "../services/api/authApi";
import { updateUserProfile, updateUserStatus } from "../services/api/userApi";
import { getAuthToken, setAuthToken } from "../services/api/apiClient";
import { disconnectSocket, initSocket } from "../services/socket/socketClient";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [session, setSession] = useState(() => getAuthSession());
  const [loading, setLoading] = useState(true);

  // Restore authenticated session on mount from backend if JWT exists
  useEffect(() => {
    async function restoreSession() {
      const token = getAuthToken();
      if (token) {
        try {
          const data = await getMe();
          if (data?.user) {
            setUser(data.user);
            const liveSession = {
              isAuthenticated: true,
              email: data.user.email,
              isDemo: false,
              loginAt: new Date().toISOString(),
            };
            setSession(liveSession);
            saveAuthSession(liveSession);
            initSocket();
          }
        } catch (err) {
          console.warn("[UserContext] Failed to restore live session from JWT:", err.message);
          setAuthToken(null);
        }
      }
      setLoading(false);
    }
    restoreSession();
  }, []);

  // Update profile
  const updateUser = useCallback(
    async (updater) => {
      let nextData;
      setUser((prev) => {
        nextData = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
        saveStoredUser(nextData);
        return nextData;
      });

      // If in live backend mode, persist to MongoDB
      if (session?.isAuthenticated && !session?.isDemo) {
        try {
          if (updater.status) {
            await updateUserStatus(updater.status);
          }
          await updateUserProfile({
            name: nextData.displayName || nextData.name,
            title: nextData.title,
            bio: nextData.bio,
            timezone: nextData.timezone,
            avatarUrl: nextData.avatar || nextData.avatarUrl,
          });
        } catch (err) {
          console.warn("[UserContext] Failed to persist profile to backend:", err.message);
        }
      }
    },
    [session]
  );

  // Login handler: supports both real backend and isolated demo mode
  const login = useCallback(async ({ email, password, isDemo = false }) => {
    if (isDemo) {
      const demoEmail = email?.trim() || "joy@example.com";
      const demoSession = {
        isAuthenticated: true,
        email: demoEmail,
        isDemo: true,
        loginAt: new Date().toISOString(),
      };
      saveAuthSession(demoSession);
      setSession(demoSession);
      setUser((prev) => {
        const next = { ...prev, email: demoEmail };
        saveStoredUser(next);
        return next;
      });
      return { success: true, isDemo: true };
    }

    // Live Backend Authentication
    const data = await loginUser({ email, password });
    const liveSession = {
      isAuthenticated: true,
      email: data.user.email,
      isDemo: false,
      loginAt: new Date().toISOString(),
    };
    saveAuthSession(liveSession);
    setSession(liveSession);
    setUser(data.user);
    initSocket();
    return { success: true, user: data.user };
  }, []);

  // Register handler: supports both real backend and isolated demo mode
  const register = useCallback(async ({ name, email, password, isDemo = false }) => {
    if (isDemo) {
      const demoEmail = email?.trim() || "newuser@example.com";
      const demoName = name?.trim() || "New Teammate";
      const demoSession = {
        isAuthenticated: true,
        email: demoEmail,
        isDemo: true,
        loginAt: new Date().toISOString(),
      };
      saveAuthSession(demoSession);
      setSession(demoSession);
      setUser((prev) => {
        const next = { ...prev, displayName: demoName, email: demoEmail };
        saveStoredUser(next);
        return next;
      });
      return { success: true, isDemo: true };
    }

    // Live Backend Registration
    const data = await registerUser({ name, email, password });
    const liveSession = {
      isAuthenticated: true,
      email: data.user.email,
      isDemo: false,
      loginAt: new Date().toISOString(),
    };
    saveAuthSession(liveSession);
    setSession(liveSession);
    setUser(data.user);
    initSocket();
    return { success: true, user: data.user };
  }, []);

  // Logout handler
  const logout = useCallback(async () => {
    if (!session?.isDemo) {
      try {
        await logoutUser();
      } catch (err) {
        console.warn("[UserContext] Logout error:", err);
      }
    }
    disconnectSocket();
    clearAuthSession();
    setSession({ isAuthenticated: false, user: null });
  }, [session]);

  // Demo reset
  const resetDemoState = useCallback(() => {
    disconnectSocket();
    const { user: freshUser } = resetAllStorage();
    setUser(freshUser);
    setSession({ isAuthenticated: false, user: null });
  }, []);

  const value = useMemo(
    () => ({
      user,
      updateUser,
      session,
      isAuthenticated: Boolean(session?.isAuthenticated),
      isDemo: Boolean(session?.isDemo),
      loading,
      login,
      register,
      logout,
      resetDemoState,
    }),
    [user, updateUser, session, loading, login, register, logout, resetDemoState]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}