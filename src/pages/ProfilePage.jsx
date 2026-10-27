import { motion } from "motion/react";
import useProfileForm from "../hooks/useProfileForm";
import {
  ProfileHeader,
  AvatarPicker,
  StatusPicker,
  ProfileForm,
  PasswordSection,
  AccountActions,
} from "../components/profile";

export default function ProfilePage() {
  const { profile, update, setField, isDirty, save, reset, message } =
    useProfileForm();

  return (
    <main className="h-dvh w-full overflow-y-auto bg-[#faf8fc] font-sans text-[#211b28]">
      <ProfileHeader profile={profile} />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 mx-auto -mt-12 grid w-full max-w-[1100px] gap-5 px-5 pb-10 sm:px-8 lg:grid-cols-[320px_1fr]"
      >
        <div className="flex flex-col gap-5">
          <AvatarPicker
            value={profile.avatar}
            onChange={(id) => setField("avatar", id)}
          />
          <StatusPicker
            value={profile.status}
            onChange={(id) => setField("status", id)}
          />
        </div>

        <div className="flex flex-col gap-5">
          <ProfileForm
            profile={profile}
            onChange={update}
            onSave={save}
            onReset={reset}
            isDirty={isDirty}
            message={message}
          />
          <PasswordSection />
        </div>

        <AccountActions />
      </motion.div>
    </main>
  );
}