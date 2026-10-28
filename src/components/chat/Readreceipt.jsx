const labels = { sent: "Sent", delivered: "Delivered", read: "Read" };

// One tick = sent, two faded ticks = delivered, two solid ticks = read.
export default function ReadReceipt({ status = "sent" }) {
  const double = status !== "sent";
  const tone = status === "read" ? "text-white" : "text-white/50";

  const label = labels[status] || labels.sent;

  return (
    <span className={`inline-flex ${tone}`} title={label} role="img" aria-label={label}>
      <svg
        viewBox="0 0 18 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-[18px]"
        aria-hidden="true"
      >
        <path d="M1 6.5 4.5 10 11 2.5" />
        {double && <path d="M6 6.5 9.5 10 16 2.5" />}
      </svg>
    </span>
  );
}