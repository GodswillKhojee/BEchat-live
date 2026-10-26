export default function AuthFooter({ mode, onSwitch }) {
  const isLogin = mode === "login";

  return (
    <>
      <p className="mt-5 text-center text-[10px] leading-6 text-[#817989] sm:text-xs">
        {isLogin ? "New to Teamspace?" : "Already have an account?"}
        <button
          type="button"
          className="ml-1.5 font-bold text-[#7F5D99] hover:underline"
          onClick={() => onSwitch(isLogin ? "register" : "login")}
        >
          {isLogin ? "Create an account" : "Sign in"}
        </button>
      </p>

      <p className="mt-4 text-center text-[9px] leading-5 text-[#a59cab]">
        By continuing, you agree to our{" "}
        <a href="#terms" className="text-[#7F5D99]">
          Terms
        </a>{" "}
        and{" "}
        <a href="#privacy" className="text-[#7F5D99]">
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}