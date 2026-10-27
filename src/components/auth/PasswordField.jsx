import { useState } from "react";
import FormField, { inputClass } from "../../common/FormField";

export default function PasswordField({
  mode = "login",
  label = "Password",
  name = "password",
  value,
  onChange,
  placeholder = "At least 8 characters",
  autoComplete = mode === "login" ? "current-password" : "new-password",
  minLength = 8,
}) {
  const [show, setShow] = useState(false);

  return (
    <FormField label={label}>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          required
          className={`${inputClass} pr-[58px]`}
        />

        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#7F5D99] hover:text-[#4C2365] sm:text-[11px]"
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
    </FormField>
  );
}