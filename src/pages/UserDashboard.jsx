import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiActivity, FiLogOut, FiRefreshCw, FiUsers, FiUser, FiCalendar, FiMoon, FiSun, FiLink, FiMessageSquare } from "react-icons/fi";
import { MdEmojiEvents } from "react-icons/md";
import toast from "react-hot-toast";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationBell from "../components/NotificationBell";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/user/dashboard");
      setData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load your auction dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const auction = data?.auction;
  const stats = data?.stats;

  return (
    <div className="min-w-0">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"><div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6"><Link to="/dashboard" className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white">A</span><span className="min-w-0"><span className="block truncate font-bold">AuctionPro</span><span className="block truncate text-xs text-slate-500 dark:text-slate-400">User workspace</span></span></Link><div className="flex items-center gap-2"><NotificationBell /><span className="hidden max-w-36 truncate text-sm font-medium sm:block">{user?.username}</span><button type="button" onClick={toggleTheme} aria-label="Toggle theme" className="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">{theme === "dark" ? <FiSun size={19} /> : <FiMoon size={19} />}</button><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:hover:bg-rose-950/40"><FiLogOut /> <span className="hidden sm:inline">Sign out</span></button></div></div></header>

      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#101b3a] via-[#152d63] to-[#39206a] p-6 text-white shadow-xl sm:p-9"><div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" /><div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-blue-200">Your auction dashboard</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{auction?.name || "Welcome to AuctionPro"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/80">{auction?.description || "View your assigned auction, explore teams and review player profiles."}</p>{auction?.auctionId && <span className="mt-5 inline-flex rounded-lg border border-white/15 bg-white/10 px-3 py-2 font-mono text-xs sm:text-sm">{auction.auctionId}</span>}</div><div className="flex items-center gap-2 self-start rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-200 md:self-auto"><FiActivity /> {auction?.status || "Loading auction"}</div></div></section>

        {loading ? <div className="flex min-h-52 items-center justify-center text-sm text-slate-500"><FiRefreshCw className="mr-2 animate-spin" /> Loading your auction...</div> : data ? <>
          <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/live-auction" className="group rounded-2xl border border-blue-200 bg-blue-50 p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-blue-900 dark:bg-blue-950/40">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Auction room</p><h2 className="mt-2 text-lg font-bold">Live bidding</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">View bids, players, and team budgets.</p></div><FiActivity size={22} /></div>
          </Link>
          <button type="button" onClick={async () => { try { const response = await api.post("/player-registration/links"); await navigator.clipboard.writeText(response.data.url); toast.success("Player registration link copied."); } catch (error) { toast.error(error.response?.data?.message || "Unable to create registration link."); } }} className="text-left group rounded-2xl border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Player registration</p><h2 className="mt-2 text-lg font-bold">Copy public link</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Share your auction's player form.</p></div><FiLink size={22} /></div>
          </button>
          <Link to="/feedback" className="group rounded-2xl border border-violet-200 bg-violet-50 p-5 transition hover:-translate-y-0.5 hover:shadow-lg dark:border-violet-900 dark:bg-violet-950/30">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-400">Help improve</p><h2 className="mt-2 text-lg font-bold">Send feedback</h2><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Share ideas or report an issue.</p></div><FiMessageSquare size={22} /></div>
          </Link>
          <Link to="/manage/teams" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Squad management</p><h2 className="mt-2 text-lg font-bold">Manage teams</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create teams, update details, and upload team logos.</p></div><span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{data.teams?.length || 0}</span></div>
          </Link>
          <Link to="/manage/players" className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">Player pool</p><h2 className="mt-2 text-lg font-bold">Manage players</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add player profiles, photos, base prices, and team assignments.</p></div><span className="rounded-xl bg-violet-50 px-3 py-2 text-sm font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{data.players?.length || 0}</span></div>
          </Link>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[{ label: "Teams registered", value: stats?.teamCount ?? 0, icon: FiUsers, tone: "blue" }, { label: "Players in pool", value: stats?.playerCount ?? 0, icon: FiUser, tone: "violet" }, { label: "Available players", value: stats?.available ?? 0, icon: MdEmojiEvents, tone: "emerald" }, { label: "Players sold", value: stats?.sold ?? 0, icon: FiActivity, tone: "amber" }].map(({ label, value, icon: Icon, tone }) => <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><p className="text-sm text-slate-500 dark:text-slate-400">{label}</p><span className={`rounded-xl p-2.5 ${tone === "blue" ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-300" : tone === "violet" ? "bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-300" : tone === "emerald" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300" : "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300"}`}><Icon size={19} /></span></div><p className="mt-4 text-3xl font-black tracking-tight">{value}</p></article>)}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800"><div><h2 className="font-bold">Teams</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Teams registered in your auction</p></div><span className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{data.teams?.length || 0}</span></div>{data.teams?.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.teams.slice(0, 8).map((team) => <div key={team._id} className="flex items-center gap-3 p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">{team.logoUrl ? <img src={team.logoUrl} alt={`${team.name} logo`} className="h-full w-full object-cover" /> : team.shortName}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{team.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{team.shortName}</p></div><span className="text-xs text-slate-400">Team</span></div>)}</div> : <div className="p-8 text-center text-sm text-slate-500">No teams have been added yet.</div>}</div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800"><div><h2 className="font-bold">Player pool</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Latest player profiles</p></div><span className="rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">{data.players?.length || 0}</span></div>{data.players?.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.players.slice(0, 8).map((player) => <div key={player._id} className="flex items-center gap-3 p-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">{player.imageUrl ? <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover" /> : <FiUser size={18} />}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{player.name}</p><p className="truncate text-xs text-slate-500 dark:text-slate-400">{player.role}{player.teamId?.name ? ` · ${player.teamId.name}` : ""}</p></div><div className="text-right"><p className="text-sm font-semibold">{money(player.basePrice)}</p><p className="text-xs capitalize text-slate-400">{player.status}</p></div></div>)}</div> : <div className="p-8 text-center text-sm text-slate-500">No players have been added yet.</div>}</div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><div className="flex items-start gap-3"><span className="rounded-xl bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-300"><FiCalendar size={20} /></span><div><h2 className="font-semibold">Auction details</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Starting budget: {money(auction?.startingBudget)} · Minimum bid: {money(auction?.minimumBid)} · Bid increment: {money(auction?.bidIncrement)}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Maximum teams: {auction?.maxTeams} · Players per team: {auction?.maxPlayersPerTeam}{auction?.auctionDate ? ` · Date: ${new Date(auction.auctionDate).toLocaleDateString()}` : ""}</p></div></div></section>
        </> : <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"><p>We couldn't load your auction dashboard.</p><button type="button" onClick={loadDashboard} className="mt-3 inline-flex items-center gap-2 font-semibold underline"><FiRefreshCw /> Try again</button></div>}
      </div>
    </div>
  );
}
