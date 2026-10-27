import { motion } from "motion/react";
import Card from "../../common/Card";
import { statusOptions } from "./Status";

export default function StatusPicker({ value, onChange }) {
  return (
    <Card title="Status" description="Let your team know when you're available.">
      <div className="flex flex-col gap-2" role="radiogroup" aria-label="Status">
        {statusOptions.map((status) => {
          const selected = value === status.id;
          return (
            <motion.button
              key={status.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={status.label}
              whileTap={{ scale: 0.99 }}
              onClick={() => onChange(status.id)}
              className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                selected
                  ? "border-[#4C2365] bg-[#faf8fc]"
                  : "border-[#ece7f0] hover:border-[#C4A4DA]"
              }`}
            >
              <span
                aria-hidden="true"
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span>
                <span className="block text-[11px] font-semibold text-[#39313f]">
                  {status.label}
                </span>
                <span className="mt-1 block text-[10px] text-[#817989]">
                  {status.hint}
                </span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </Card>
  );
}