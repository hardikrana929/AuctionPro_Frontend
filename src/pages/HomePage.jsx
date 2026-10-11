import { Link, Navigate } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiMoon, FiSun, FiUsers, FiZap } from "react-icons/fi";
import { MdEmojiEvents } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: FiZap, title: "Live auction workflow", text: "Keep your auction organized with clear status, player and team information." },
  { icon: FiUsers, title: "Team building", text: "Track registered teams, player roles and roster progress in one workspace." },
  { icon: FiBarChart2, title: "Useful insights", text: "Get a quick overview of squad sizes, player status and auction details." },
];

export default function HomePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "user") return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen overflow-hidden bg-[#070b19] text-white">
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black shadow-lg shadow-blue-600/30">A</span>
          <span><span className="block text-lg font-bold tracking-tight">AuctionPro</span><span className="block text-xs text-slate-400">Smart Auctions. Seamless Team Building.</span></span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl border border-white/10 p-2.5 text-slate-300 transition hover:bg-white/10">{theme === "dark" ? <FiSun size={18} /> : <FiMoon size={18} />}</button>
          <Link to="/admin/login" className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 sm:inline-flex">Admin</Link>
          <Link to="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500">User login</Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3.5 py-2 text-xs font-semibold tracking-wide text-blue-200"><span className="h-2 w-2 rounded-full bg-emerald-400" /> CRICKET AUCTION MANAGEMENT, SIMPLIFIED</div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Build your winning squad. <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">One bid at a time.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">A smarter workspace for cricket auctions. Manage teams, follow player pools and keep every auction detail in one place.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500">Enter your auction <FiArrowRight /></Link>
            <Link to="/admin/login" className="inline-flex items-center justify-center rounded-xl border border-white/15 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-white/5">Admin console</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm text-slate-400"><span className="inline-flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Auction-specific access</span><span className="inline-flex items-center gap-2"><FiCheckCircle className="text-emerald-400" /> Team & player management</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="absolute inset-4 rounded-[2rem] bg-blue-600/25 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#18264b] via-[#101831] to-[#17102f] p-5 shadow-2xl shadow-black/40 sm:p-7">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative flex items-start justify-between gap-3 border-b border-white/10 pb-5"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">Auction room</p><h2 className="mt-2 text-xl font-bold sm:text-2xl">Squad selection</h2><p className="mt-1 text-sm text-slate-400">A quick look at your auction workspace</p></div><span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">Ready to play</span></div>
            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:gap-4"><div className="rounded-2xl border border-white/10 bg-white/[.05] p-4"><p className="text-xs text-slate-400">Team strategy</p><div className="mt-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300"><MdEmojiEvents size={22} /></span><div><p className="font-bold">Build a squad</p><p className="text-xs text-slate-400">Balance every role</p></div></div></div><div className="rounded-2xl border border-white/10 bg-white/[.05] p-4"><p className="text-xs text-slate-400">Player pool</p><div className="mt-3 flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300"><FiUsers size={21} /></span><div><p className="font-bold">Player profiles</p><p className="text-xs text-slate-400">Roles & base prices</p></div></div></div></div>
            <div className="relative mt-4 rounded-2xl border border-white/10 bg-[#080e21]/70 p-4 sm:p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold">Auction workflow</p><span className="text-xs text-slate-500">Simple. Clear. Focused.</span></div><div className="mt-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-blue-500/15 p-3 text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 text-blue-300"><FiUsers /></span><p className="mt-2 text-xs font-semibold">Teams</p></div><div className="rounded-xl bg-violet-500/15 p-3 text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300"><MdEmojiEvents /></span><p className="mt-2 text-xs font-semibold">Players</p></div><div className="rounded-xl bg-emerald-500/15 p-3 text-center"><span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300"><FiBarChart2 /></span><p className="mt-2 text-xs font-semibold">Insights</p></div></div></div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-white/[.02] px-5 py-16 sm:px-8 sm:py-20"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-blue-300">Everything in one place</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Less admin. More game.</h2><p className="mt-4 leading-7 text-slate-400">Keep your cricket auction organized from the first team to the final player.</p></div><div className="mt-9 grid gap-4 md:grid-cols-3">{features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-blue-400/30 hover:bg-white/[.06]"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/15 text-blue-300"><Icon size={21} /></span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{text}</p></article>)}</div></div></section>
      <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} AuctionPro · Smart Auctions. Seamless Team Building.</footer>
    </main>
  );
}
