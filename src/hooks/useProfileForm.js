import { useState } from "react";
import { useUser } from "./useUser";

export default function useProfileForm() {
  const { user, updateUser } = useUser();
  const [profile, setProfile] = useState(user);
  const [message, setMessage] = useState("");

  const setField = (name, value) => {
    setProfile((prev) => ({ ...prev, [name]: value }));
    setMessage("");
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
  };

  const isDirty = Object.keys(profile).some((key) => profile[key] !== user[key]);

  const reset = () => {
    setProfile(user);
    setMessage("");
  };

  // Placeholder: replace with an API call (PATCH /users/me) later.
  const save = (e) => {
    e?.preventDefault();
    updateUser(profile);
    setMessage("Saved for this session only. Connect your API to store changes.");
  };

  return { profile, update, setField, setPhoto, isDirty, save, reset, message };
}