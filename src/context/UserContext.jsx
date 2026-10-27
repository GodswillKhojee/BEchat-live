import { useCallback, useMemo, useState } from "react";
import { UserContext } from "./userContext";
import {
  clearAuthSession,
  getAuthSession,
  getStoredUser,
  resetAllStorage,
  saveAuthSession,
  saveStoredUser,
} from "../services/storageService";

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [session, setSession] = useState(() => getAuthSession());

  // Keep user profile in sync with local storage
  const updateUser = useCallback((updater) => {
    setUser((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveStoredUser(next);
      return next;
    });
  }, []);

  // Demo Login: Validates and creates session in localStorage
  const login = useCallback(({ email, isDemo = false }) => {
    const demoEmail = email?.trim() || "joy@example.com";
    const newSession = {
      isAuthenticated: true,
      email: demoEmail,
      isDemo,
      loginAt: new Date().toISOString(),
    };
    saveAuthSession(newSession);
    setSession(newSession);

    setUser((prev) => {
      const next = { ...prev, email: demoEmail };
      saveStoredUser(next);
      return next;
    });

    return { success: true };
  }, []);

  // Demo Register: Creates new profile details and sets session
  const register = useCallback(({ name, email }) => {
    const demoEmail = email?.trim() || "newuser@example.com";
    const demoName = name?.trim() || "New Teammate";
    const newSession = {
      isAuthenticated: true,
      email: demoEmail,
      isDemo: true,
      loginAt: new Date().toISOString(),
    };
    saveAuthSession(newSession);
    setSession(newSession);

    setUser((prev) => {
      const next = {
        ...prev,
        displayName: demoName,
        email: demoEmail,
      };
      saveStoredUser(next);
      return next;
    });

    return { success: true };
  }, []);

  // Demo Logout: Clears session
  const logout = useCallback(() => {
    clearAuthSession();
    setSession({ isAuthenticated: false, user: null });
  }, []);

  // Full reset back to initial seed state
  const resetDemoState = useCallback(() => {
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
      login,
      register,
      logout,
      resetDemoState,
    }),
    [user, updateUser, session, login, register, logout, resetDemoState]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}