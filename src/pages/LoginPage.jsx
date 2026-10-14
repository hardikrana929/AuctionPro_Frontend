import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMoon,
  FiSun,
  FiTag,
  FiUser,
  FiShield,
  FiArrowRight,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, loginUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState(
    location.pathname === "/admin/login" ? "admin" : "user",
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [auctionId, setAuctionId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const dark = theme === "dark";

  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "user") return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (
      !username.trim() ||
      !password ||
      (mode === "user" && !auctionId.trim())
    ) {
      toast.error(
        mode === "user"
          ? "Enter username, password, and Auction ID."
          : "Enter username and password.",
      );
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "admin") {
        await login(username.trim(), password);
        toast.success("Admin login successful.");
        navigate("/admin", { replace: true });
      } else {
        await loginUser(
          username.trim(),
          password,
          auctionId.trim().toUpperCase(),
        );
        toast.success("Login successful. Welcome to your auction!");
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to sign in. Check your credentials.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = `w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 ${
    dark
      ? "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
  }`;

  return (
    <main
      className={`relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12 transition-colors ${dark ? "bg-[#070b19] text-white" : "bg-slate-50 text-slate-900"}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.20),_transparent_48%)]" />
      <Link
        to="/"
        className={`absolute left-4 top-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${dark ? "text-slate-300 hover:bg-white/5" : "text-slate-600 hover:bg-white"}`}
      >
        <FiArrowLeft /> Home
      </Link>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={`absolute right-4 top-5 rounded-xl border p-3 shadow-sm ${dark ? "border-slate-700 bg-slate-900 text-slate-200" : "border-slate-200 bg-white text-slate-700"}`}
      >
        {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
      </button>

      <section
        className={`relative w-full max-w-lg overflow-hidden rounded-3xl border p-6 shadow-2xl sm:p-9 ${dark ? "border-slate-800 bg-slate-900/95 shadow-black/30" : "border-slate-200 bg-white shadow-slate-200/70"}`}
      >
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/25">
            A
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">AuctionPro</h1>
            <p
              className={`text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}
            >
              Smart Auctions. Seamless Team Building.
            </p>
          </div>
        </div>

        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
          Welcome back
        </p>
        <h2 className="text-2xl font-bold sm:text-3xl">
          Sign in to your workspace
        </h2>
        <p
          className={`mt-2 text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-500"}`}
        >
          Choose your account type, then enter your credentials.
        </p>

        <div
          className={`mt-7 grid grid-cols-2 rounded-2xl p-1 ${dark ? "bg-slate-950" : "bg-slate-100"}`}
          role="tablist"
          aria-label="Login type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "user"}
            onClick={() => setMode("user")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${mode === "user" ? "bg-blue-600 text-white shadow" : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            <FiUser /> User login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "admin"}
            onClick={() => setMode("admin")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${mode === "admin" ? "bg-blue-600 text-white shadow" : dark ? "text-slate-400 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            <FiShield /> Admin login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="login-username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>
            <div className="relative">
              <FiUser
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-500" : "text-slate-400"}`}
              />
              <input
                id="login-username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={
                  mode === "admin"
                    ? "Enter admin username"
                    : "Enter your username"
                }
                maxLength={50}
                required
                className={`${fieldClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <div className="relative">
              <FiLock
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-500" : "text-slate-400"}`}
              />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className={`${fieldClass} pl-10 pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 ${dark ? "text-slate-400 hover:bg-slate-800" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {mode === "user" && (
            <div>
              <label
                htmlFor="login-auction-id"
                className="mb-2 block text-sm font-medium"
              >
                Auction ID
              </label>
              <div className="relative">
                <FiTag
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${dark ? "text-slate-500" : "text-slate-400"}`}
                />
                <input
                  id="login-auction-id"
                  value={auctionId}
                  onChange={(e) => setAuctionId(e.target.value.toUpperCase())}
                  placeholder="e.g. AUC-BC034CFDE9"
                  maxLength={30}
                  required
                  className={`${fieldClass} pl-10 uppercase`}
                />
              </div>
              <p
                className={`mt-2 text-xs ${dark ? "text-slate-500" : "text-slate-500"}`}
              >
                Use the Auction ID assigned to you by the administrator.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Signing in..."
              : mode === "admin"
                ? "Sign in to admin console"
                : "Enter your auction"}
            {!submitting && <FiArrowRight />}
          </button>
        </form>

        <p
          className={`mt-6 text-center text-xs leading-5 ${dark ? "text-slate-500" : "text-slate-500"}`}
        >
          {mode === "admin"
            ? "Administrator access is restricted to authorized admin accounts."
            : "Your account can access only its assigned auction."}
        </p>
      </section>
    </main>
  );
}
