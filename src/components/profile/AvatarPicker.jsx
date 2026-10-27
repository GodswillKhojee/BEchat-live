import { motion } from "motion/react";
import Card from "../../common/Card";
import { avatars } from "../../data/avatars";

export default function AvatarPicker({ value, onChange }) {
  return (
    <Card title="Avatar" description="Pick the one that suits you.">
      <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Avatar">
        {avatars.map((avatar) => {
          const selected = value === avatar.id;
          return (
            <motion.button
              key={avatar.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={avatar.label}
              whileTap={{ scale: 0.97 }}
              onClick={() => onChange(avatar.id)}
              className={`aspect-square overflow-hidden rounded-2xl border-2 bg-[#C4A4DA] transition ${
                selected
                  ? "border-[#4C2365] ring-4 ring-[#9E7FB5]/25"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={avatar.src}
                alt=""
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            </motion.button>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] leading-5 text-[#a59cab] sm:text-[11px]">
        Custom photo upload will be added with the file-upload backend.
      </p>
    </Card>
  );
}