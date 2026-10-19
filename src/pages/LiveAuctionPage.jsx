import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { FiActivity, FiArrowLeft, FiPause, FiPlay, FiRefreshCw, FiCheckCircle, FiXCircle, FiUsers } from "react-icons/fi";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";

const money = (value) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value || 0));
const cardClass = "rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900";

export default function LiveAuctionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const auctionId = String(params.auctionId || (localStorage.getItem("auctionpro_auction_id") || sessionStorage.getItem("auctionpro_auction_id")) || "").toUpperCase();
  const isAdmin = user?.role === "admin";
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState({ bids: [], sold: [], unsold: [] });
  const token = localStorage.getItem("auctionpro_token") || sessionStorage.getItem("auctionpro_token");

  const loadState = useCallback(async (showSpinner = false) => {
    if (!auctionId) {
      setLoading(false);
      return;
    }
    if (showSpinner) setLoading(true);
    try {
      const [stateResponse, historyResponse] = await Promise.all([
        api.get(`/auction-control/${auctionId}/state`),
        api.get(`/auction-control/${auctionId}/history`),
      ]);
      setData(stateResponse.data);
      setHistory(historyResponse.data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load live auction.");
    } finally {
      setLoading(false);
    }
  }, [auctionId]);

  useEffect(() => {
    loadState(true);
    const interval = window.setInterval(() => loadState(false), 8000);
    const socket = io(import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    socket.on("connect", () => socket.emit("auction:join", auctionId));
    socket.on("bid:new", () => loadState(false));
    socket.on("player:current", () => loadState(false));
    socket.on("player:sold", () => loadState(false));
    socket.on("player:unsold", () => loadState(false));
    socket.on("auction:state", () => loadState(false));
    socket.on("notification:new", (notification) => {
      if (notification?.auctionId === auctionId) toast(notification.title || notification.message);
    });
    socket.on("connect_error", () => {
      // The polling refresh remains active if the socket cannot connect.
    });
    return () => {
      window.clearInterval(interval);
      socket.disconnect();
    };
  }, [auctionId, loadState, token]);

  const session = data?.session;
  const player = data?.currentPlayer;
  const teams = data?.teams || [];
  const latestBid = data?.bids?.[0];
  const nextBid = useMemo(() => latestBid ? Number(latestBid.amount) + Number(data?.auction?.bidIncrement || 0) : Number(player?.basePrice || data?.auction?.minimumBid || 0), [latestBid, data?.auction?.bidIncrement, data?.auction?.minimumBid, player?.basePrice]);
  const leadingTeam = teams.find((team) => String(team._id) === String(session?.leadingTeamId));

  async function runAction(path, body = {}) {
    setBusy(true);
    try {
      const response = await api.post(`/auction-control/${auctionId}/${path}`, body);
      toast.success(response.data.message || "Auction updated.");
      await loadState(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Auction action failed.");
    } finally {
      setBusy(false);
    }
  }

  async function placeBid(event) {
    event.preventDefault();
    if (!selectedTeam) return toast.error("Select your team before bidding.");
    await runAction("bids", { teamId: selectedTeam, amount: nextBid });
  }

  if (loading) return <LoadingState label="Loading live auction..." />;
  if (!auctionId) return <EmptyState title="No auction selected" description="Log in with your assigned auction ID, or open Live Bidding from an admin auction card." />;
  if (!data) return <EmptyState title="Auction unavailable" description="Check your auction assignment and try refreshing." />;

  return (
    <div className="space-y-6">
      <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400"><FiArrowLeft /> Back</button>
      <PageHeader eyebrow="AuctionPro · Live room" title={data.auction.name} description={`Auction ID: ${data.auction.auctionId} · Live bidding, player outcomes, and team purse tracking.`} action={<button type="button" onClick={() => loadState(true)} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><FiRefreshCw /> Refresh</button>} />

      <section className="grid gap-4 sm:grid-cols-3">
        {[{ label: "Auction status", value: session?.status || "idle" }, { label: "Players remaining", value: data.availablePlayers?.length || 0 }, { label: "Players sold", value: history.sold?.length || 0 }].map((item) => <article key={item.label} className={`${cardClass} p-5`}><p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p><p className="mt-2 text-2xl font-black capitalize">{item.value}</p></article>)}
      </section>

      {<section className={`${cardClass} flex flex-wrap items-center gap-3 p-4`}>
        {session?.status !== "live" ? <button disabled={busy || session?.status === "completed"} onClick={() => runAction("start")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><FiPlay /> Start / Resume bidding</button> : <button disabled={busy} onClick={() => runAction("pause")} className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><FiPause /> Pause bidding</button>}
        <button disabled={busy || session?.status !== "live" || Boolean(player)} onClick={() => runAction("next-player")} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><FiUsers /> Select next player</button>
        <button disabled={busy || !player || !session?.leadingTeamId} onClick={() => runAction("sold")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><FiCheckCircle /> Mark sold</button>
        <button disabled={busy || !player} onClick={() => runAction("unsold")} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50"><FiXCircle /> Mark unsold</button>
      </section>}

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,.8fr)]">
        <article className={`${cardClass} overflow-hidden`}>
          <div className="border-b border-slate-200 p-5 dark:border-slate-800"><p className="text-xs font-bold uppercase tracking-[.2em] text-blue-600 dark:text-blue-400">Current player</p><h2 className="mt-1 text-xl font-bold">{player?.name || "Waiting for the auctioneer"}</h2></div>
          {player ? <div className="grid gap-5 p-5 sm:grid-cols-[200px_minmax(0,1fr)]">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">{player.imageUrl ? <img src={player.imageUrl} alt={player.name} className="h-full w-full object-cover" /> : <div className="flex h-full min-h-48 items-center justify-center text-5xl font-black text-slate-300">{player.name?.slice(0, 1)}</div>}</div>
            <div className="flex min-w-0 flex-col">
              <p className="text-sm text-slate-500 dark:text-slate-400">Player role</p><p className="mt-1 font-semibold">{player.role}</p>
              <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Base price</p><p className="mt-1 font-semibold">{money(player.basePrice)}</p>
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-[#101b3a] to-[#39206a] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-blue-200">Current bid</p><p className="mt-2 text-3xl font-black sm:text-4xl">{money(latestBid?.amount || player.basePrice)}</p><p className="mt-2 text-sm text-blue-100">{leadingTeam?.name || "No team has bid yet"}</p><p className="mt-3 text-xs text-blue-100/80">Next valid bid: {money(nextBid)} · Increment: {money(data.auction.bidIncrement)}</p></div>
              {<form onSubmit={placeBid} className="mt-5 space-y-3"><label className="block text-sm font-semibold">Bid as team<select value={selectedTeam} onChange={(event) => setSelectedTeam(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"><option value="">Select your team</option>{teams.map((team) => <option key={team._id} value={team._id}>{team.name} · Remaining {money(team.remainingBudget)}</option>)}</select></label><button type="submit" disabled={busy || session?.status !== "live" || !player} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:opacity-50">Place bid · {money(nextBid)}</button></form>}
            </div>
          </div> : <div className="p-10"><EmptyState title="No active player" description={"Start bidding, then select the next available player."} /></div>}
        </article>

        <aside className="space-y-6">
          <article className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Team budgets</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Purse remaining after sold players.</p></div><div className="divide-y divide-slate-100 dark:divide-slate-800">{teams.length ? teams.map((team) => <div key={team._id} className="p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold">{team.name}</p><p className="text-sm font-bold">{money(team.remainingBudget)}</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min(100, Math.max(0, team.remainingBudget / data.auction.startingBudget * 100))}%` }} /></div><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Spent {money(team.spent)} · {team.playersBought} players</p></div>) : <EmptyState title="No teams yet" description="Add at least two teams before starting an auction." />}</div></article>
          <article className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Recent bids</h2></div>{data.bids?.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{data.bids.map((bid) => <div key={bid._id} className="flex items-center justify-between gap-3 p-4"><div><p className="text-sm font-semibold">{bid.teamId?.name || "Team"}</p><p className="text-xs text-slate-500 dark:text-slate-400">{bid.placedBy?.username || "Auction user"} · {new Date(bid.createdAt).toLocaleTimeString()}</p></div><p className="font-bold">{money(bid.amount)}</p></div>)}</div> : <EmptyState title="No bids yet" description="Accepted bids will appear here in real time." />}</article>
        </aside>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Sold players ({history.sold?.length || 0})</h2></div>{history.sold?.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{history.sold.slice(0, 10).map((item) => <div key={item._id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.teamId?.name || "Team"}</p></div><p className="font-bold text-emerald-600">{money(item.soldPrice)}</p></div>)}</div> : <EmptyState title="No sold players yet" description="Completed sales will be listed here." />}</article>
        <article className={`${cardClass} overflow-hidden`}><div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-bold">Unsold players ({history.unsold?.length || 0})</h2></div>{history.unsold?.length ? <div className="divide-y divide-slate-100 dark:divide-slate-800">{history.unsold.slice(0, 10).map((item) => <div key={item._id} className="flex items-center justify-between gap-3 p-4"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{item.role}</p></div><span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">Unsold</span></div>)}</div> : <EmptyState title="No unsold players" description="Players marked unsold will appear here." />}</article>
      </section>
    </div>
  );
}
