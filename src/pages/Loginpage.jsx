import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import logo from "../assets/logo.png";
import useAuthForm from "../hooks/useAuthForm";
import { useUser } from "../hooks/useUser";
import {
  SplashScreen,
  BrandPanel,
  AuthTabs,
  AuthHeader,
  AuthForm,
  GoogleButton,
  AuthFooter,
} from "../components/auth";

export default function Loginpage() {
  const [introDone, setIntroDone] = useState(false);
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const { form, update, reset } = useAuthForm();
  const { isAuthenticated, login, register } = useUser();
  const navigate = useNavigate();

  // If user is already authenticated in local demo storage, redirect directly to /chat
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const handleQuickDemo = () => {
    login({ email: "joy@example.com", password: "password123", isDemo: true });
    navigate("/chat");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password || form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "register") {
      if (!form.name || form.name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }
      register({ name: form.name, email: form.email, password: form.password });
    } else {
      login({ email: form.email, password: form.password, isDemo: true });
    }

    navigate("/chat");
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setError("");
    reset();
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#faf8fc] font-sans text-[#211b28]">
      <AnimatePresence>{!introDone && <SplashScreen />}</AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="grid h-full w-full grid-cols-1 md:grid-cols-[.92fr_1.08fr]"
      >
        <BrandPanel />

        <section className="flex h-full min-h-0 w-full items-center justify-center overflow-y-auto bg-[radial-gradient(ellipse_at_85%_10%,_#C4A4DA18,_transparent_32%),_#fcfbfd] px-5 py-5 sm:px-7 md:px-8 lg:px-10">
          <div className="my-auto w-full max-w-[420px] py-3">
            {/* Mobile logo */}
            <div className="mb-5 flex items-center gap-2.5 text-sm font-bold md:hidden">
              <img
                src={logo}
                alt=""
                className="h-[60px] w-[60px] object-contain brightness-0 invert"
              />
              <span>ChatLive</span>
            </div>

            <AuthTabs mode={mode} onChange={handleModeSwitch} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === "login" ? -16 : 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === "login" ? 16 : -16 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
                className="w-full"
              >
                <AuthHeader mode={mode} />
                <AuthForm
                  mode={mode}
                  form={form}
                  error={error}
                  onChange={update}
                  onSubmit={handleSubmit}
                  onQuickDemo={handleQuickDemo}
                />
              </motion.div>
            </AnimatePresence>

            <GoogleButton
              onClick={() =>
                alert(
                  "Google OAuth authentication is planned for Phase 2 once backend and cloud client credentials are configured. For Phase 1 demo access, use the form or Quick Fill."
                )
              }
            />
            <AuthFooter mode={mode} onSwitch={handleModeSwitch} />
          </div>
        </section>
      </motion.section>
    </main>
  );
}