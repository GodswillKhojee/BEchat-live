import { useState } from "react";
import { motion } from "motion/react";
import Card from "../../common/Card";
import PasswordField from "../auth/PasswordField";

const empty = { current: "", next: "", confirm: "" };

export default function PasswordSection() {
  const [values, setValues] = useState(empty);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError("");
    setNotice("");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (values.next.length < 8) {
      return setError("New password must be at least 8 characters.");
    }
    if (values.next !== values.confirm) {
      return setError("The new passwords do not match.");
    }
    if (values.next === values.current) {
      return setError("Choose a password different from your current one.");
    }

    // Placeholder: call PATCH /auth/password once the backend exists.
    setValues(empty);
    setNotice("Checks passed, but no password was changed. This needs the backend.");
  };

  return (
    <Card title="Password" description="Use at least 8 characters.">
      <form onSubmit={onSubmit}>
        <PasswordField
          label="Current password"
          name="current"
          value={values.current}
          onChange={onChange}
          placeholder="Your current password"
          autoComplete="current-password"
          minLength={1}
        />
        <PasswordField
          label="New password"
          name="next"
          value={values.next}
          onChange={onChange}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          name="confirm"
          value={values.confirm}
          onChange={onChange}
          placeholder="Repeat the new password"
          autoComplete="new-password"
        />

        {error && (
          <p role="alert" className="mb-3 text-[11px] leading-5 text-[#c0566b]">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="mb-3 text-[11px] leading-5 text-[#7F5D99]">
            {notice}
          </p>
        )}

        <motion.button
          type="submit"
          whileTap={{ scale: 0.985 }}
          className="min-h-[44px] rounded-[10px] bg-[#4C2365] px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors hover:bg-[#603579] sm:text-[13px]"
        >
          Update password
        </motion.button>
      </form>
    </Card>
  );
}