import { Link, Navigate } from "react-router-dom";
import { FiArrowRight, FiBarChart2, FiCheckCircle, FiMoon, FiSun, FiUsers, FiZap, FiShield } from "react-icons/fi";
import { MdEmojiEvents } from "react-icons/md";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const features = [
  { icon: FiZap, title: "Live auction workflow", text: "Keep auctions organized with clear status, player and team information." },
  { icon: FiUsers, title: "Team building", text: "Track team rosters, player roles and squad progress in one workspace." },
  { icon: FiBarChart2, title: "Useful insights", text: "Review player pools, team counts and auction details at a glance." },
];

export default function HomePage() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const dark = theme === "dark";
  if (user?.role === "admin") return <Navigate to="/admin" replace />;
  if (user?.role === "user") return <Navigate to="/dashboard" replace />;

  return (
    <main className={`min-h-screen overflow-hidden transition-colors ${dark ? "bg-[#070b19] text-white" : "bg-slate-50 text-slate-900"}`}>
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-600/30">A</span>
          <span className="min-w-0"><span className="block text-lg font-bold tracking-tight">AuctionPro</span><span className={`block text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>Smart Auctions. Seamless Team Building.</span></span>
        </Link>
        <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button type="button" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle light/dark mode" className={`rounded-xl border p-2.5 transition ${dark ? "border-white/10 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"}`}>{dark ? <FiSun size={18} /> : <FiMoon size={18} />}</button>
          <Link to="/login" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">Sign in</Link>
        </nav>
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:pb-28 lg:pt-24">
        <div className={`pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full blur-[120px] ${dark ? "bg-blue-600/20" : "bg-blue-400/20"}`} />
        <div className="relative z-10">
          <div className={`mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold tracking-wide ${dark ? "border-blue-400/20 bg-blue-400/10 text-blue-200" : "border-blue-200 bg-blue-50 text-blue-800"}`}><span className="h-2 w-2 rounded-full bg-emerald-400" /> CRICKET AUCTION MANAGEMENT, SIMPLIFIED</div>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">Build your winning squad. <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 bg-clip-text text-transparent">One bid at a time.</span></h1>
          <p className={`mt-6 max-w-xl text-base leading-7 sm:text-lg ${dark ? "text-slate-300" : "text-slate-600"}`}>A smarter workspace for cricket auctions. Manage teams, follow player pools and keep every auction detail in one place.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-700">Choose login type <FiArrowRight /></Link>
            <Link to="/admin/login" className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 text-sm font-semibold transition ${dark ? "border-white/15 text-slate-200 hover:bg-white/5" : "border-slate-300 text-slate-700 hover:bg-white"}`}><FiShield /> Admin access</Link>
          </div>
          <div className={`mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm ${dark ? "text-slate-400" : "text-slate-600"}`}><span className="inline-flex items-center gap-2"><FiCheckCircle className="text-emerald-500" /> Auction-specific access</span><span className="inline-flex items-center gap-2"><FiCheckCircle className="text-emerald-500" /> Team & player management</span></div>
        </div>

        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className={`absolute inset-4 rounded-[2rem] blur-3xl ${dark ? "bg-blue-600/25" : "bg-blue-500/15"}`} />
          <div className={`relative overflow-hidden rounded-[2rem] border p-5 shadow-2xl sm:p-7 ${dark ? "border-white/10 bg-gradient-to-br from-[#18264b] via-[#101831] to-[#17102f] shadow-black/30" : "border-slate-200 bg-white shadow-slate-300/40"}`}>
            <div className={`absolute right-0 top-0 h-48 w-48 rounded-full blur-3xl ${dark ? "bg-violet-500/15" : "bg-violet-400/15"}`} />
            <div className={`relative flex items-start justify-between gap-3 border-b pb-5 ${dark ? "border-white/10" : "border-slate-200"}`}><div><p className={`text-xs font-bold uppercase tracking-[.22em] ${dark ? "text-blue-300" : "text-blue-700"}`}>Auction room</p><h2 className="mt-2 text-xl font-bold sm:text-2xl">Squad selection</h2><p className={`mt-1 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>Your auction workspace at a glance</p></div><span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${dark ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>Ready to play</span></div>
            <div className="relative mt-5 grid grid-cols-2 gap-3 sm:gap-4">
              {[{label:"Team strategy",title:"Build a squad",sub:"Balance every role",icon:MdEmojiEvents,accent:"blue"},{label:"Player pool",title:"Player profiles",sub:"Roles & base prices",icon:FiUsers,accent:"violet"}].map(({label,title,sub,icon:Icon,accent})=><div key={label} className={`rounded-2xl border p-4 ${dark ? "border-white/10 bg-white/[.05]" : "border-slate-200 bg-slate-50"}`}><p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{label}</p><div className="mt-3 flex items-center gap-3"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent==="blue" ? "bg-blue-500/15 text-blue-500" : "bg-violet-500/15 text-violet-500"}`}><Icon size={22}/></span><div><p className="font-bold">{title}</p><p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{sub}</p></div></div></div>)}
            </div>
            <div className={`relative mt-4 rounded-2xl border p-4 sm:p-5 ${dark ? "border-white/10 bg-[#080e21]/70" : "border-slate-200 bg-slate-50"}`}><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Auction workflow</p><span className={`text-xs ${dark ? "text-slate-500" : "text-slate-500"}`}>Simple. Clear. Focused.</span></div><div className="mt-5 grid grid-cols-3 gap-2">{[{label:"Teams",icon:FiUsers},{label:"Players",icon:MdEmojiEvents},{label:"Insights",icon:FiBarChart2}].map(({label,icon:Icon},i)=><div key={label} className={`rounded-xl p-3 text-center ${dark ? ["bg-blue-500/15","bg-violet-500/15","bg-emerald-500/15"][i] : ["bg-blue-100","bg-violet-100","bg-emerald-100"][i]}`}><span className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg ${dark ? ["bg-blue-500/20 text-blue-300","bg-violet-500/20 text-violet-300","bg-emerald-500/20 text-emerald-300"][i] : ["bg-blue-200 text-blue-700","bg-violet-200 text-violet-700","bg-emerald-200 text-emerald-700"][i]}`}><Icon/></span><p className="mt-2 text-xs font-semibold">{label}</p></div>)}</div></div>
          </div>
        </div>
      </section>

      <section className={`border-t px-5 py-16 sm:px-8 sm:py-20 ${dark ? "border-white/10 bg-white/[.02]" : "border-slate-200 bg-white"}`}><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className={`text-xs font-bold uppercase tracking-[.22em] ${dark ? "text-blue-300" : "text-blue-700"}`}>Everything in one place</p><h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Less admin. More game.</h2><p className={`mt-4 leading-7 ${dark ? "text-slate-400" : "text-slate-600"}`}>Keep your cricket auction organized from the first team to the final player.</p></div><div className="mt-9 grid gap-4 md:grid-cols-3">{features.map(({icon:Icon,title,text})=><article key={title} className={`rounded-2xl border p-6 transition ${dark ? "border-white/10 bg-white/[.04] hover:border-blue-400/30 hover:bg-white/[.06]" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-white"}`}><span className={`flex h-11 w-11 items-center justify-center rounded-xl ${dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-100 text-blue-700"}`}><Icon size={21}/></span><h3 className="mt-5 text-lg font-bold">{title}</h3><p className={`mt-2 text-sm leading-6 ${dark ? "text-slate-400" : "text-slate-600"}`}>{text}</p></article>)}</div></div></section>
      <footer className={`border-t px-5 py-6 text-center text-xs ${dark ? "border-white/10 text-slate-500" : "border-slate-200 text-slate-500"}`}>© {new Date().getFullYear()} AuctionPro · Smart Auctions. Seamless Team Building.</footer>
    </main>
  );
}
