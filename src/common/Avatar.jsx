import { getAvatar } from "../data/avatars";
import { statusOptions } from "../constants/status";

export default function Avatar({ avatarId, photo, status, className = "h-24 w-24" }) {
  const usePhoto = avatarId === "photo" && Boolean(photo);
  const avatar = getAvatar(avatarId);
  const current = statusOptions.find((option) => option.id === status);

  return (
    <div className={`relative shrink-0 ${className}`}>
      <img
        src={usePhoto ? photo : avatar.src}
        alt={usePhoto ? "Profile photo" : avatar.label}
        className={`h-full w-full rounded-full bg-[#C4A4DA] object-cover ring-4 ring-white/50 ${
          usePhoto ? "" : "[image-rendering:pixelated]"
        }`}
      />
      {current && (
        <span
          title={current.label}
          style={{ backgroundColor: current.color }}
          className="absolute bottom-0.5 right-0.5 h-[18%] min-h-3 w-[18%] min-w-3 rounded-full border-2 border-white"
        />
      )}
    </div>
  );
}