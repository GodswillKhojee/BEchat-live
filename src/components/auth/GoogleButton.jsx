import { motion } from "motion/react";

export default function GoogleButton({ onClick }) {
  return (
    <>
      <div className="my-4 flex items-center gap-3 text-[9px] font-bold tracking-[.12em] text-[#a79eae] sm:my-5">
        <span className="h-px flex-1 bg-[#ece7f0]" />
        <span>OR CONTINUE WITH</span>
        <span className="h-px flex-1 bg-[#ece7f0]" />
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={onClick}
        className="flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-[10px] border border-[#e6e0e9] bg-white p-3 text-[11px] font-semibold text-[#554c5d] transition hover:border-[#C4A4DA] hover:bg-[#fbf8fd] sm:text-xs"
      >
        <span className="font-sans text-[17px] font-bold text-[#4285f4]">G</span>
        Continue with Google
      </motion.button>
    </>
  );
}