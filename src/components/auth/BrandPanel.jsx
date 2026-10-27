import logo from "../../assets/logo.png";

const features = ["Real-time conversations", "One space for your whole team"];

export default function BrandPanel() {
  return (
    <aside className="relative hidden h-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#4C2365] via-[#603b78] to-[#7F5D99] px-8 py-7 text-white md:flex lg:px-[clamp(30px,6vw,88px)] lg:py-10">
      <div className="pointer-events-none absolute -right-[260px] top-[10%] h-[540px] w-[540px] rounded-full border border-white/10 after:absolute after:-right-[-75px] after:top-[75px] after:h-[390px] after:w-[390px] after:rounded-full after:border after:border-white/10 after:content-['']" />
      <div className="pointer-events-none absolute -bottom-[70px] -left-[70px] h-[190px] w-[190px] rounded-full bg-[#C4A4DA]/10" />
      <div className="pointer-events-none absolute right-[12%] top-[8%] h-[90px] w-[90px] rounded-full bg-[#C4A4DA]/15" />

      <div className="relative z-10">
        <div className="mb-8 h-[60px] w-[60px] lg:mb-10">
          <img
            src={logo}
            alt="ChatLive logo"
            className="h-full w-full object-contain brightness-0 invert"
          />
        </div>

        <p className="mb-3 text-[10px] font-bold tracking-[.17em] text-[#D9C2E8] lg:text-[11px]">
          YOUR TEAM, IN SYNC
        </p>

        <h1 className="font-dogica-pixel text-[clamp(28px,3.4vw,50px)] font-bold leading-[1.45]">
          Good work
          <br />
          <span className="text-[#D5B9E8]">
            happens
            <br className="hidden xl:block" /> together.
          </span>
        </h1>

        <p className="mb-5 mt-5 max-w-[365px] text-[13px] leading-[1.8] text-[#e9dfee] lg:mt-6 lg:text-[15px]">
          Bring conversations, ideas, and your team into one calm, connected
          space.
        </p>

        {features.map((feature, i) => (
          <div
            key={feature}
            className="my-3 flex items-center gap-3 text-[11px] text-[#f5eff9] lg:text-[13px]"
          >
            <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-[9px] border border-white/20 bg-white/10 text-[#E3C8F4]">
              {i ? "◉" : "✦"}
            </span>
            {feature}
          </div>
        ))}
      </div>

      <p className="relative z-10 text-[9px] tracking-[.15em] text-[#d8c6e3]/70 lg:text-[10px]">
        CONNECT · COLLABORATE · CREATE
      </p>
    </aside>
  );
}