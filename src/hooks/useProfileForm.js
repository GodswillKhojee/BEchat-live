import { useState } from "react";
import { mockUser } from "../data/Mockuser";

export default function useProfileForm(initial = mockUser) {
  const [profile, setProfile] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [message, setMessage] = useState("");

  const setField = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
    setMessage("");
  };

  const update = (e) => setField(e.target.name, e.target.value);

  const isDirty = JSON.stringify(profile) !== JSON.stringify(saved);

  const reset = () => {
    setProfile(saved);
    setMessage("");
  };

  // Placeholder: replace with an API call (PATCH /users/me) later.
  const save = (e) => {
    e?.preventDefault();
    setSaved(profile);
    setMessage("Saved for this session only. Connect your API to store changes.");
  };

  return { profile, update, setField, isDirty, save, reset, message };
}