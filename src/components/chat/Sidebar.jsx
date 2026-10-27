import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";
import Avatar from "../../common/Avatar";

export default function Sidebar({ user }) {
  return (
    <nav
      aria-label="Main"
      className="hidden w-[72px] shrink-0 flex-col items-center justify-between bg-gradient-to-b from-[#4C2365] to-[#603b78] py-5 md:flex"
    >
      <div className="flex flex-col items-center gap-6">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white p-2 shadow-lg shadow-[#2a103d]/20">
          <img src={logo} alt="ChatLive" className="h-full w-full object-contain" />
        </span>

        <Link
          to="/chat"
          title="Chats"
          aria-label="Chats"
          aria-current="page"
          className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/25"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
        </Link>
      </div>

      <Link to="/profile" title="Your profile" aria-label="Your profile">
        <Avatar
          avatarId={user.avatar}
          photo={user.photo}
          status={user.status}
          className="h-11 w-11"
        />
      </Link>
    </nav>
  );
}