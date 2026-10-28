import { useState } from "react";
import { useUser } from "./useUser";

export default function useProfileForm() {
  const { user, updateUser } = useUser();
  const [profile, setProfile] = useState(user);
  const [prevUser, setPrevUser] = useState(user);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Sync draft state if external user context updates (e.g., storage reload or demo reset)
  if (user !== prevUser) {
    setPrevUser(user);
    setProfile(user);
  }

  const setField = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
    setMessage("");
    setErrorMessage("");
  };

  const update = (e) => setField(e.target.name, e.target.value);

  // Passing null removes the photo and falls back to a pixel avatar
  const setPhoto = (photo) => {
    setProfile((prev) => ({
      ...prev,
      photo,
      avatar: photo ? "photo" : prev.avatar === "photo" ? "female" : prev.avatar,
    }));
    setMessage("");
    setErrorMessage("");
  };

  const isDirty = Boolean(
    user &&
      profile &&
      Object.keys({ ...user, ...profile }).some((key) => profile[key] !== user[key])
  );

  const reset = () => {
    setProfile(user || {});
    setMessage("");
    setErrorMessage("");
  };

  const save = (e) => {
    e?.preventDefault();
    setErrorMessage("");

    if (!profile.displayName || profile.displayName.trim().length === 0) {
      setErrorMessage("Display name cannot be empty.");
      return;
    }

    updateUser(profile);
    setMessage("Profile saved successfully to local browser storage.");
  };

  return {
    profile,
    update,
    setField,
    setPhoto,
    isDirty,
    save,
    reset,
    message,
    errorMessage,
  };
}