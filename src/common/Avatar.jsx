import { useState } from "react";
import { getAvatar } from "../data/avatars";
import { statusOptions } from "../constants/status";

export default function Avatar({
  avatarId = "female",
  photo,
  status,
  className = "h-24 w-24",
}) {
  const [imgError, setImgError] = useState(false);
  const usePhoto = (avatarId === "photo" || !avatarId) && Boolean(photo) && !imgError;
  const fallbackAvatar = getAvatar(avatarId === "photo" ? "female" : avatarId);
  const current = statusOptions.find((option) => option.id === status);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={usePhoto ? photo : fallbackAvatar.src}
        alt={usePhoto ? "Profile photo" : fallbackAvatar.label}
        onError={() => setImgError(true)}
        className={`h-full w-full rounded-full bg-[#C4A4DA] object-cover ring-4 ring-white/50 ${
          usePhoto ? "" : "[image-rendering:pixelated]"
        }`}
      />
      {current && (
        <span
          title={`Status: ${current.label}`}
          style={{ backgroundColor: current.color }}
          className="absolute bottom-0.5 right-0.5 h-[20%] min-h-3 w-[20%] min-w-3 rounded-full border-2 border-white shadow-sm"
        />
      )}
    </div>
  );
}