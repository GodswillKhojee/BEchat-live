import logo from "../../assets/logo.png";

export default function EmptyChat() {
  return (
    <div className="grid h-full place-items-center px-6 text-center">
      <div>
        <img
          src={logo}
          alt=""
          className="mx-auto mb-5 h-[72px] w-[72px] object-contain opacity-90"
        />
        <h2 className="font-dogica-pixel text-[12px] font-bold leading-[2.2] sm:text-[14px]">
          Pick a conversation
        </h2>
        <p className="mx-auto mt-2 max-w-[300px] text-[12px] leading-[1.8] text-[#817989]">
          Choose a channel or a teammate from the list to start chatting.
        </p>
      </div>
    </div>
  );
}