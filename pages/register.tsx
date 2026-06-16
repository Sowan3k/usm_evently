import { useRouter } from "next/router";
import { useState } from "react";
import { signIn } from "next-auth/react";
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

  return (
    <div>
      <Header />

      <div
        className="flex items-center justify-center min-h-screen"
        style={{
          backgroundImage: "url('/background-image.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-10 max-w-md w-full">
          <div className="flex flex-col items-center">
            <img src="/usm-logo.png" alt="USM Logo" className="h-16 mb-4" />
            <h1 className="text-3xl font-bold text-yellow-600 mb-1">
              USM Evently
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              {mode === "login"
                ? "Sign in to continue"
                : "Create your student account"}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
              {mode === "register" && (
                <>
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <div className="flex gap-2">
                    <select
                      name="identityType"
                      value={formData.identityType}
                      onChange={handleChange}
                      className="px-3 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500 bg-white"
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
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 -mt-1 px-2">
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
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />

              {error && (
                <p className="text-sm text-red-600 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 mt-2 text-white bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg shadow hover:shadow-lg hover:from-yellow-500 hover:to-yellow-700 disabled:opacity-60"
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
              className="mt-5 text-sm text-usmPurple hover:underline"
            >
              {mode === "login"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>

            {mode === "login" && (
              <p className="mt-4 text-xs text-gray-500 text-center">
                Demo login — student:{" "}
                <span className="font-mono">noormohammadsowan@student.usm.my</span>{" "}
                / <span className="font-mono">student123</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
