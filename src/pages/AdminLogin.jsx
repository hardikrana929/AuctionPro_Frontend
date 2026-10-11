import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FiLock, FiMoon, FiSun, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function AdminLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";

  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (user?.role === "user") {
    return <Navigate to="/dashboard" replace />;
  }

  // function toggleTheme() {
  //   const next = !dark;
  //   setDark(next);
  //   document.documentElement.classList.toggle("dark", next);
  //   localStorage.setItem("auctionpro_theme", next ? "dark" : "light");
  // }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!username.trim() || !password) {
      toast.error("Enter your username and password.");
      return;
    }

    setSubmitting(true);

    try {
      await login(username.trim(), password);
      toast.success("Welcome to AuctionPro!");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to sign in. Check your credentials and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.18),_transparent_45%)]" />

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
        className="absolute right-5 top-5 rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      >
        {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <section className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AuctionPro</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Smart Auctions. Seamless Team Building.
            </p>
          </div>
        </div>

        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          Administration
        </p>
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sign in to manage your auctions and users.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium"
            >
              Admin username
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950">
              <FiUser className="shrink-0 text-slate-400" />
              <input
                id="username"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your admin username"
                maxLength={50}
                required
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950">
              <FiLock className="shrink-0 text-slate-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-xs font-semibold text-blue-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in as Admin"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
          Restricted access. Only authorized Admin accounts can sign in here.
        </p>
      </section>
    </main>
  );
}
