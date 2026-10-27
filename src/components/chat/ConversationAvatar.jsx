import Avatar from "../../common/Avatar";

export default function ConversationAvatar({ conversation, className = "h-11 w-11" }) {
  if (conversation.type === "channel") {
    return (
      <span
        aria-hidden="true"
        className={`grid shrink-0 place-items-center rounded-full bg-[#C4A4DA] font-dogica-pixel text-[12px] font-bold text-[#4C2365] ${className}`}
      >
        #
      </span>
    );
  }

  return (
    <Avatar
      avatarId={conversation.avatar}
      status={conversation.status}
      className={className}
    />
  );
}