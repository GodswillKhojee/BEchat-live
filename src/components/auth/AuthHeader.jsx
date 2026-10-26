export default function AuthHeader({ mode }) {
  const isLogin = mode === "login";

  return (
    <header className="mb-5">
      <p className="mb-3 text-[10px] font-bold tracking-[.17em] text-[#9E7FB5] lg:text-[11px]">
        {isLogin ? "WELCOME BACK" : "GET STARTED"}
      </p>

      <h2 className="mb-2 font-dogica-pixel text-[14px] font-bold leading-[2] sm:text-[16px] lg:text-[18px]">
        {isLogin ? "Sign in to your space" : "Create your account"}
      </h2>

      <p className="text-[12px] leading-[1.8] text-[#817989] sm:text-[13px]">
        {isLogin
          ? "Pick up where your team left off."
          : "Your team's next chapter starts here."}
      </p>
    </header>
  );
}