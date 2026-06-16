import { useRouter } from "next/router";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";

type Mode = "login" | "register";

export default function Register() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("login");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    identityType: "MATRIC",
    identityNumber: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "register") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Registration failed");
          return;
        }
      }

      // Both flows finish by signing in with the credentials.
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        setError(
          mode === "register"
            ? "Account created, but sign-in failed. Please try logging in."
            : "Invalid email or password"
        );
        return;
      }

      router.push("/home");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none transition-all focus:border-brand-violet/60 focus:bg-white/10 focus:ring-2 focus:ring-brand-violet/40";

  return (
    <div className="aurora-bg relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-brand-violet/30 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-brand-cyan/20 blur-3xl animate-float"
        style={{ animationDelay: "3s" }}
      />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md rounded-3xl glass-strong border border-white/10 p-8 shadow-glass-lg sm:p-10"
          >
            <div className="flex flex-col items-center">
              <img src="/usm-logo.png" alt="USM Logo" className="h-14 mb-4" />
              <h1 className="font-display text-3xl font-bold gradient-text">
                USM Evently
              </h1>
              <p className="mt-2 mb-7 text-sm text-white/60">
                {mode === "login"
                  ? "Sign in to continue"
                  : "Create your USM account"}
              </p>

              <form
                onSubmit={handleSubmit}
                className="flex w-full flex-col gap-4"
              >
                {mode === "register" && (
                  <>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                    <div className="flex gap-2">
                      <select
                        name="identityType"
                        value={formData.identityType}
                        onChange={handleChange}
                        className="rounded-xl border border-white/15 bg-ink-800 px-3 py-2.5 text-white outline-none focus:border-brand-violet/60 focus:ring-2 focus:ring-brand-violet/40"
                      >
                        <option value="MATRIC">Matric No.</option>
                        <option value="IC">IC</option>
                        <option value="PASSPORT">Passport</option>
                      </select>
                      <input
                        type="text"
                        name="identityNumber"
                        placeholder="Your matric / IC / passport no."
                        value={formData.identityNumber}
                        onChange={handleChange}
                        required
                        className={`flex-1 ${inputClass}`}
                      />
                    </div>
                    <p className="-mt-1 px-1 text-xs text-white/40">
                      USM students &amp; staff only. Your ID is used for
                      verification and is never shown publicly.
                    </p>
                  </>
                )}
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className={inputClass}
                />

                {error && (
                  <p className="rounded-lg bg-red-500/15 px-3 py-2 text-center text-sm text-red-300">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo px-6 py-3 font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:opacity-60"
                >
                  {loading
                    ? "Please wait..."
                    : mode === "login"
                      ? "Sign In"
                      : "Create Account"}
                </button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode(mode === "login" ? "register" : "login");
                }}
                className="mt-5 text-sm text-brand-cyan transition-colors hover:text-white"
              >
                {mode === "login"
                  ? "New here? Create an account"
                  : "Already have an account? Sign in"}
              </button>

              {mode === "login" && (
                <p className="mt-4 text-center text-xs text-white/40">
                  Demo login, student:{" "}
                  <span className="font-mono text-white/60">
                    noormohammadsowan@student.usm.my
                  </span>{" "}
                  / <span className="font-mono text-white/60">student123</span>
                </p>
              )}
            </div>
          </motion.div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
