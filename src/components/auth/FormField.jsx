export const inputClass =
  "block w-full min-w-0 rounded-[10px] border border-[#e5dfe9] bg-white px-3.5 py-3 text-[12px] leading-6 text-[#211b28] outline-none transition placeholder:text-[#b0a8b7] focus:border-[#9E7FB5] focus:ring-[3px] focus:ring-[#9E7FB5]/15";

export default function FormField({
  label,
  hint,
  multiline = false,
  rows = 3,
  className = "",
  children,
  ...inputProps
}) {
  return (
    <label className="mb-3 block">
      <span className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-semibold text-[#39313f] sm:text-xs">
        {label}
        {hint && (
          <span className="text-[10px] font-normal text-[#a59cab] sm:text-[11px]">
            {hint}
          </span>
        )}
      </span>
      {children ??
        (multiline ? (
          <textarea
            rows={rows}
            className={`${inputClass} resize-y ${className}`}
            {...inputProps}
          />
        ) : (
          <input className={`${inputClass} ${className}`} {...inputProps} />
        ))}
    </label>
  );
}
