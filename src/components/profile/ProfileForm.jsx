import { motion } from "motion/react";
import Card from "../../common/Card";
import FormField, { inputClass } from "../../common/FormField";

const supported =
  typeof Intl.supportedValuesOf === "function"
    ? Intl.supportedValuesOf("timeZone")
    : [];
const timeZones = [...new Set(["UTC", ...supported])];

const BIO_LIMIT = 160;

export default function ProfileForm({
  profile,
  onChange,
  onSave,
  onReset,
  isDirty,
  message,
}) {
  return (
    <Card title="Personal details" description="How you appear to your team.">
      <form onSubmit={onSave}>
        <FormField
          label="Display name"
          name="displayName"
          value={profile.displayName}
          onChange={onChange}
          placeholder="Your name"
          autoComplete="name"
          maxLength={50}
          required
        />

        <FormField
          label="Email address"
          hint="Read only"
          type="email"
          name="email"
          value={profile.email}
          autoComplete="email"
          disabled
          readOnly
        />

        <FormField
          label="Job title"
          name="title"
          value={profile.title}
          onChange={onChange}
          placeholder="What do you do?"
          autoComplete="organization-title"
          maxLength={60}
        />

        <FormField label="Time zone">
          <select
            name="timezone"
            value={profile.timezone}
            onChange={onChange}
            className={inputClass}
          >
            {timeZones.map((zone) => (
              <option key={zone} value={zone}>
                {zone}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="About you"
          hint={`${profile.bio.length}/${BIO_LIMIT}`}
          multiline
          rows={3}
          name="bio"
          value={profile.bio}
          onChange={onChange}
          placeholder="A short line for your teammates"
          maxLength={BIO_LIMIT}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <motion.button
            type="submit"
            whileTap={{ scale: 0.985 }}
            disabled={!isDirty}
            className="min-h-[44px] rounded-[10px] bg-[#4C2365] px-5 py-2.5 text-[12px] font-bold text-white shadow-lg shadow-[#4C2365]/15 transition-colors hover:bg-[#603579] disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]"
          >
            Save changes
          </motion.button>

          <button
            type="button"
            onClick={onReset}
            disabled={!isDirty}
            className="min-h-[44px] rounded-[10px] border border-[#e6e0e9] bg-white px-5 py-2.5 text-[12px] font-semibold text-[#554c5d] transition hover:border-[#C4A4DA] disabled:cursor-not-allowed disabled:opacity-40 sm:text-[13px]"
          >
            Discard
          </button>

          {isDirty && (
            <span className="text-[10px] text-[#9E7FB5] sm:text-[11px]">
              Unsaved changes
            </span>
          )}
        </div>

        {message && (
          <p role="status" className="mt-3 text-[11px] leading-5 text-[#7F5D99]">
            {message}
          </p>
        )}
      </form>
    </Card>
  );
}