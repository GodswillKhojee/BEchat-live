export default function Card({ title, description, children, className = "" }) {
  return (
    <section
      className={`rounded-2xl border border-[#ece7f0] bg-white p-5 shadow-sm shadow-[#4C2365]/5 sm:p-6 ${className}`}
    >
      {title && (
        <header className="mb-4">
          <h2 className="font-dogica-pixel text-[11px] font-bold leading-[2.2] text-[#211b28] sm:text-[12px]">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-[11px] leading-[1.8] text-[#817989] sm:text-xs">
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}