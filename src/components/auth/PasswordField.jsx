import { useState } from "react";
import FormField, { inputClass } from "./FormField";

export default function PasswordField({ mode, value, onChange }) {
  const [show, setShow] = useState(false);

  return (
    <FormField label="Password">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          name="password"
          value={value}
          onChange={onChange}
          placeholder="At least 8 characters"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={8}
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