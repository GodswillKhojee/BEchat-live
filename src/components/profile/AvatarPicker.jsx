import { useRef, useState } from "react";
import { motion } from "motion/react";
import Card from "../../common/Card";
import { avatars } from "../../data/avatars";
import {
  ACCEPTED_IMAGE_TYPES,
  readImageAsDataUrl,
  validateImageFile,
} from "../../utils/imageFile";

const tileClass = (selected) =>
  `aspect-square overflow-hidden rounded-2xl border-2 bg-[#C4A4DA] transition ${
    selected
      ? "border-[#4C2365] ring-4 ring-[#9E7FB5]/25"
      : "border-transparent opacity-70 hover:opacity-100"
  }`;

export default function AvatarPicker({ avatar, photo, onSelect, onPhotoChange }) {
  const fileRef = useRef(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const openPicker = () => fileRef.current?.click();

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow choosing the same file again
    if (!file) return;

    const problem = validateImageFile(file);
    if (problem) return setError(problem);

    setBusy(true);
    setError("");
    try {
      onPhotoChange(await readImageAsDataUrl(file));
    } catch {
      setError("That image couldn't be read. Try a different file.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card title="Avatar" description="Choose a pixel avatar or upload your own photo.">
      <div className="grid grid-cols-3 gap-2.5" role="radiogroup" aria-label="Avatar">
        {avatars.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={avatar === item.id}
            aria-label={item.label}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(item.id)}
            className={tileClass(avatar === item.id)}
          >
            <img
              src={item.src}
              alt=""
              className="h-full w-full object-cover [image-rendering:pixelated]"
            />
          </motion.button>
        ))}

        {photo ? (
          <motion.button
            type="button"
            role="radio"
            aria-checked={avatar === "photo"}
            aria-label="Your photo"
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect("photo")}
            className={tileClass(avatar === "photo")}
          >
            <img src={photo} alt="" className="h-full w-full object-cover" />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            aria-label="Upload a photo"
            whileTap={{ scale: 0.97 }}
            onClick={openPicker}
            disabled={busy}
            className="grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-[#C4A4DA] text-[#7F5D99] transition hover:bg-[#f6f0fa] disabled:opacity-50"
          >
            <span className="text-center text-[10px] font-semibold leading-4">
              <span className="block text-[20px] leading-6" aria-hidden="true">+</span>
              {busy ? "Working" : "Photo"}
            </span>
          </motion.button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        onChange={onFile}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      {photo && (
        <div className="mt-3 flex gap-4 text-[11px] font-bold sm:text-xs">
          <button
            type="button"
            onClick={openPicker}
            disabled={busy}
            className="text-[#7F5D99] hover:underline disabled:opacity-50"
          >
            Change photo
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              onPhotoChange(null);
            }}
            className="text-[#c0566b] hover:underline"
          >
            Remove photo
          </button>
        </div>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[11px] leading-5 text-[#c0566b]">
          {error}
        </p>
      )}

      <p className="mt-3 text-[10px] leading-5 text-[#a59cab] sm:text-[11px]">
        JPG, PNG, WebP or GIF up to 5 MB. Photos are cropped to a square and
        resized. Press Save changes to apply everywhere.
      </p>
    </Card>
  );
}