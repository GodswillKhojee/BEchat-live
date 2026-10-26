import { motion } from "motion/react";
import FormField from "./FormField";
import PasswordField from "./PasswordField";

export default function AuthForm({ mode, form, onChange, onSubmit }) {
  const isLogin = mode === "login";

  return (
    <form onSubmit={onSubmit}>
      {!isLogin && (
        <FormField
          label="Full name"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Your name"
          autoComplete="name"
          required
        />
      )}

      <FormField
        label="Email address"
        type="email"
        name="email"
        value={form.email}
        onChange={onChange}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <PasswordField mode={mode} value={form.password} onChange={onChange} />

      {isLogin ? (
        <div className="mb-4 flex items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-[10px] text-[#746b7b] sm:text-[11px]">
            <input type="checkbox" className="accent-[#4C2365]" />
            Remember me
          </label>

          <button
            type="button"
            className="text-[10px] font-bold text-[#7F5D99] hover:underline sm:text-[11px]"
            onClick={() => alert("Connect your password-reset flow here.")}
          >
            Forgot password?
          </button>
        </div>
      ) : (
        <label className="mb-4 flex items-start gap-2 text-[10px] leading-5 text-[#746b7b] sm:text-[11px]">
          <input
            type="checkbox"
            required
            className="mt-1 shrink-0 accent-[#4C2365]"
          />
          <span>I agree to the terms and privacy policy.</span>
        </label>
      )}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.985 }}
        className="flex min-h-[48px] w-full items-center justify-between rounded-[10px] bg-[#4C2365] px-4 py-3 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors duration-200 hover:bg-[#603579] sm:text-[13px]"
      >
        <span>{isLogin ? "Sign in" : "Create account"}</span>
        <span className="text-[17px]" aria-hidden="true">
          ↗
        </span>
      </motion.button>
    </form>
  );
}