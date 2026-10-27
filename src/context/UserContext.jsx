import { useMemo, useState } from "react";
import { mockUser } from "../data/Mockuser";
import { UserContext } from "./userContext";

// Holds the signed-in user so the profile page, sidebar and chat stay in sync.
// Replace the initial value with the user from your API once auth exists.
export function UserProvider({ children }) {
  const [user, setUser] = useState(mockUser);
  const value = useMemo(() => ({ user, updateUser: setUser }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}