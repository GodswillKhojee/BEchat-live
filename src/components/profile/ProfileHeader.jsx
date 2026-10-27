import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import Avatar from "../../common/Avatar";

export default function ProfileHeader({ profile }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-[#4C2365] via-[#603b78] to-[#7F5D99] px-5 pb-20 pt-6 text-white sm:px-8 lg:px-[clamp(30px,6vw,88px)]">
      <div className="pointer-events-none absolute -right-[160px] -top-[120px] h-[420px] w-[420px] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-[60px] left-[8%] h-[150px] w-[150px] rounded-full bg-[#C4A4DA]/10" />

      <div className="relative z-10 mx-auto w-full max-w-[1100px]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white p-1.5">
              <img src={logo} alt="" className="h-full w-full object-contain" />
            </span>
            Teamspace
          </div>

          <Link
            to="/chat"
            className="rounded-[10px] border border-white/25 bg-white/10 px-3.5 py-2 text-[11px] font-semibold text-white transition hover:bg-white/20 sm:text-xs"
          >
            Back to chats
          </Link>
        </div>

        <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar avatarId={profile.avatar} status={profile.status} />

          <div className="min-w-0">
            <p className="mb-2 text-[10px] font-bold tracking-[.17em] text-[#D9C2E8] lg:text-[11px]">
              YOUR PROFILE
            </p>
            <h1 className="break-words font-dogica-pixel text-[14px] font-bold leading-[2] sm:text-[18px] lg:text-[22px]">
              {profile.displayName || "Unnamed"}
            </h1>
            <p className="mt-1 text-[12px] text-[#e9dfee] sm:text-[13px]">
              {profile.title || "No title yet"}
            </p>
            <p className="break-all text-[11px] text-[#d8c6e3] sm:text-xs">
              {profile.email}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}