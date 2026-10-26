const tabs = [
  { id: "login", label: "Sign in" },
  { id: "register", label: "Create account" },
];

export default function AuthTabs({ mode, onChange }) {
  const tabClass = (tab) =>
    `flex min-h-[48px] flex-1 items-center justify-center rounded-[9px] px-2 py-3 text-center text-[11px] font-semibold leading-5 transition-all duration-200 sm:text-[13px] ${
      mode === tab
        ? "bg-white text-[#4C2365] shadow-sm"
        : "bg-transparent text-[#817489] hover:text-[#4C2365]"
    }`;

  return (
    <div
      className="mb-6 grid grid-cols-2 rounded-xl bg-[#f0ebf4] p-1"
      role="tablist"
      aria-label="Authentication mode"
    >
      {tabs.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          role="tab"
          aria-selected={mode === id}
          className={tabClass(id)}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}