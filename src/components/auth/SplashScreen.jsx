import { motion } from "motion/react";
import logo from "../../assets/logo.png";
import { palette } from "../../constants/palette";

export default function SplashScreen() {
  return (
    <motion.section
      key="splash"
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
      aria-label="Loading application"
    >
      <div className="absolute h-[340px] w-[340px] animate-pulse rounded-full bg-[radial-gradient(circle,_#C4A4DA45,_transparent_70%)]" />

      <motion.img
        src={logo}
        alt="ChatLive logo"
        initial={{ opacity: 0, scale: 0.65, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.5 },
          scale: { duration: 0.7, ease: "easeOut" },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="relative h-[118px] w-[118px] object-contain"
      />

      <div className="mt-7 flex gap-2.5">
        {[palette.dark, palette.mid, palette.light, palette.pale].map(
          (color, i) => (
            <motion.i
              key={color}
              style={{ backgroundColor: color }}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
              className="h-2 w-2 rounded-full"
            />
          )
        )}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="relative mt-[18px] text-[12px] tracking-[.08em] text-[#817989]"
      >
        A better way to work together
      </motion.p>
    </motion.section>
  );
}