import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import FormField, { inputClass } from "../../common/FormField";
import { avatars } from "../../data/avatars";
import { statusOptions } from "../../constants/status";

export default function NewConversationModal({ isOpen, onClose, onCreate }) {
  const [tab, setTab] = useState("channel"); // "channel" | "dm"
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("female");
  const [status, setStatus] = useState("active");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please provide a name.");
      return;
    }

    onCreate({
      type: tab,
      name: cleanName,
      members: tab === "channel" ? 3 : undefined,
      avatar: tab === "dm" ? avatar : undefined,
      status: tab === "dm" ? status : undefined,
    });

    setName("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-md rounded-2xl border border-[#ece7f0] bg-white p-5 shadow-2xl shadow-[#4C2365]/20 sm:p-6"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#ece7f0]">
            <h2 className="font-dogica-pixel text-[13px] font-bold text-[#211b28]">
              New Conversation
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-lg text-[#817989] hover:bg-[#f0ebf4] hover:text-[#4C2365]"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-xl bg-[#f0ebf4] p-1">
            <button
              type="button"
              onClick={() => {
                setTab("channel");
                setError("");
              }}
              className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
                tab === "channel"
                  ? "bg-white text-[#4C2365] shadow-xs"
                  : "text-[#817989] hover:text-[#4C2365]"
              }`}
            >
              # Public Channel
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("dm");
                setError("");
              }}
              className={`rounded-lg py-1.5 text-[11px] font-semibold transition ${
                tab === "dm"
                  ? "bg-white text-[#4C2365] shadow-xs"
                  : "text-[#817989] hover:text-[#4C2365]"
              }`}
            >
              Direct Message
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {error && (
              <p className="text-[11px] text-[#c0566b] font-medium">{error}</p>
            )}

            <FormField
              label={tab === "channel" ? "Channel Name" : "Teammate Name"}
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder={tab === "channel" ? "e.g. project-launch" : "e.g. Alex Rivera"}
              autoFocus
              required
            />

            {tab === "dm" && (
              <>
                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#39313f]">
                    Avatar
                  </span>
                  <div className="flex gap-3">
                    {avatars.map((av) => (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() => setAvatar(av.id)}
                        className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                          avatar === av.id
                            ? "border-[#4C2365] bg-[#faf8fc] ring-2 ring-[#C4A4DA]"
                            : "border-[#ece7f0] hover:border-[#C4A4DA]"
                        }`}
                      >
                        <img
                          src={av.src}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover [image-rendering:pixelated]"
                        />
                        <span className="text-[11px] font-medium text-[#211b28]">
                          {av.label.split(" ")[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="mb-1.5 block text-[11px] font-semibold text-[#39313f]">
                    Initial Status
                  </span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={inputClass}
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2.5 pt-3 border-t border-[#ece7f0]">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg px-3.5 py-2 text-[11px] font-semibold text-[#817989] hover:bg-[#f0ebf4]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-[#4C2365] px-4 py-2 text-[11px] font-bold text-white shadow-sm hover:bg-[#603579]"
              >
                Create Conversation
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
