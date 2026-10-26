import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import logo from "../assets/logo.png";
import useAuthForm from "../hooks/useAuthForm";
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
  const { form, update } = useAuthForm();

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroDone(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(
      `${mode === "login" ? "Login" : "Registration"} UI is ready. Connect your backend API next.`
    );
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
              <img src={logo} alt="" className="h-[34px] w-[34px] object-contain" />
              <span>Teamspace</span>
            </div>

            <AuthTabs mode={mode} onChange={setMode} />

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
                  onChange={update}
                  onSubmit={handleSubmit}
                />
              </motion.div>
            </AnimatePresence>

            <GoogleButton onClick={() => alert("Add Google OAuth here.")} />
            <AuthFooter mode={mode} onSwitch={setMode} />
          </div>
        </section>
      </motion.section>
    </main>
  );
}