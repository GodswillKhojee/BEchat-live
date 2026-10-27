import { motion } from "motion/react";
import FormField from "../../common/FormField";
import PasswordField from "./PasswordField";

export default function AuthForm({
  mode,
  form,
  onChange,
  onSubmit,
  onQuickDemo,
  error,
}) {
  const isLogin = mode === "login";

  return (
    <form onSubmit={onSubmit} className="space-y-3.5">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-[#c0566b]/30 bg-[#c0566b]/10 p-3 text-[11px] font-medium text-[#c0566b]"
        >
          {error}
        </div>
      )}

      {/* Demo Credentials Pill */}
      <div className="flex items-center justify-between rounded-xl border border-[#C4A4DA]/40 bg-[#f8f3fb] p-2.5 text-[10px] text-[#603b78] sm:text-[11px]">
        <div>
          <span className="font-bold">Demo account: </span>
          <span className="font-mono">joy@example.com</span>
        </div>
        <button
          type="button"
          onClick={onQuickDemo}
          className="rounded-lg bg-[#4C2365] px-2.5 py-1 font-bold text-white transition hover:bg-[#603b78]"
        >
          Quick Fill
        </button>
      </div>

      {!isLogin && (
        <FormField
          label="Full name"
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="Godswill Khojee"
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
        placeholder="joy@example.com"
        autoComplete="email"
        required
      />

      <PasswordField mode={mode} value={form.password} onChange={onChange} />

      {isLogin ? (
        <div className="flex items-center justify-between gap-2 pt-1">
          <label className="flex items-center gap-2 text-[10px] text-[#746b7b] sm:text-[11px]">
            <input type="checkbox" defaultChecked className="accent-[#4C2365]" />
            Remember session
          </label>

          <button
            type="button"
            className="text-[10px] font-bold text-[#7F5D99] hover:underline sm:text-[11px]"
            onClick={() =>
              alert(
                "Password recovery requires an email service (SMTP), scheduled for Phase 2. For Phase 1 demo access, please use 'Quick Demo Sign-In'."
              )
            }
          >
            Forgot password?
          </button>
        </div>
      ) : (
        <label className="flex items-start gap-2 pt-1 text-[10px] leading-5 text-[#746b7b] sm:text-[11px]">
          <input
            type="checkbox"
            required
            defaultChecked
            className="mt-1 shrink-0 accent-[#4C2365]"
          />
          <span>I agree to demo terms and local browser storage.</span>
        </label>
      )}

      <motion.button
        type="submit"
        whileTap={{ scale: 0.985 }}
        className="flex min-h-[48px] w-full items-center justify-between rounded-[10px] bg-[#4C2365] px-4 py-3 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors duration-200 hover:bg-[#603579] sm:text-[13px]"
      >
        <span>{isLogin ? "Sign in to Space" : "Create Demo Account"}</span>
        <span className="text-[17px]" aria-hidden="true">
          ↗
        </span>
      </motion.button>
    </form>
  );
}
