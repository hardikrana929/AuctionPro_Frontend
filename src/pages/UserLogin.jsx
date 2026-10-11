import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMoon,
  FiSun,
  FiTag,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function UserLogin() {
  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [auctionId, setAuctionId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user?.role === "user") return <Navigate to="/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!username.trim() || !password || !auctionId.trim()) {
      toast.error("Enter your username, password, and Auction ID.");
      return;
    }
    setSubmitting(true);
    try {
      await loginUser(
        username.trim(),
        password,
        auctionId.trim().toUpperCase(),
      );
      toast.success("Login successful. Welcome to your auction!");
      navigate("/dashboard", { replace: true });
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

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(37,99,235,0.20),_transparent_48%)]" />
      <Link
        to="/"
        className="absolute left-4 top-5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900"
      >
        <FiArrowLeft /> Home
      </Link>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="absolute right-4 top-5 rounded-xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
      >
        {theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}
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
          User access
        </p>
        <h2 className="text-2xl font-bold">Enter your auction</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Sign in with the credentials provided by your administrator and your
          assigned Auction ID.
        </p>
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="user-username"
              className="mb-2 block text-sm font-medium"
            >
              Username
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950">
              <FiUser className="shrink-0 text-slate-400" />
              <input
                id="user-username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                maxLength={50}
                required
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="user-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950">
              <FiLock className="shrink-0 text-slate-400" />
              <input
                id="user-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="rounded-md p-1 text-slate-500 hover:text-blue-600"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>
          <div>
            <label
              htmlFor="user-auction-id"
              className="mb-2 block text-sm font-medium"
            >
              Auction ID
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950">
              <FiTag className="shrink-0 text-slate-400" />
              <input
                id="user-auction-id"
                autoComplete="off"
                value={auctionId}
                onChange={(e) => setAuctionId(e.target.value.toUpperCase())}
                placeholder="e.g. AUC-12AB34CD56"
                maxLength={30}
                required
                className="min-w-0 flex-1 bg-transparent py-3 text-sm uppercase outline-none placeholder:normal-case placeholder:text-slate-400"
              />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              You can sign in only to an auction assigned to your account.
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign in to auction"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Administrator?{" "}
          <Link
            to="/admin/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Admin sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
