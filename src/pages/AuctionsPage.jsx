import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiCopy, FiPlus, FiRefreshCw, FiSearch } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";

function StatusBadge({ status }) {
  const styles = {
    draft: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    active:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    paused:
      "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    completed: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
    archived:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
        styles[status] || styles.draft
      }`}
    >
      {status}
    </span>
  );
}

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const location = useLocation();

  const loadAuctions = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/auctions");
      setAuctions(response.data.auctions || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load auctions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [loadAuctions]);

  useEffect(() => {
    if (location.state?.createdAuctionId) {
      toast.success(
        `Created ${location.state.createdAuctionName || "auction"}: ${location.state.createdAuctionId}`,
      );
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  async function copyAuctionId(id) {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Auction ID copied.");
    } catch {
      toast.error("Unable to copy. Please select and copy the ID manually.");
    }
  }

  const filtered = auctions.filter((auction) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      auction.name?.toLowerCase().includes(term) ||
      auction.auctionId?.toLowerCase().includes(term);

    return matchesSearch && (status === "all" || auction.status === status);
  });

  return (
    <div>
      <PageHeader
        eyebrow="Workspace"
        title="Auctions"
        description="View every auction, search by name or ID, and share auction IDs with assigned users."
        action={
          <Link
            to="/admin/auctions/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FiPlus /> Create auction
          </Link>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row dark:border-slate-800">
          <div className="relative flex-1">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by auction name or Auction ID..."
              aria-label="Search auctions"
              className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
              className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950 sm:flex-none"
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
            <button
              type="button"
              onClick={loadAuctions}
              title="Refresh auctions"
              aria-label="Refresh auctions"
              className="rounded-xl border border-slate-300 px-3 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <FiRefreshCw />
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading auctions..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              auctions.length ? "No matching auctions" : "No auctions created"
            }
            description={
              auctions.length
                ? "Try another search term or status filter."
                : "Create your first auction to get started."
            }
          />
        ) : (
          <>
            <div className="grid gap-4 p-4 md:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((auction) => (
                <article
                  key={auction._id}
                  className="flex min-w-0 flex-col rounded-2xl border border-slate-200 p-5 transition hover:border-blue-300 dark:border-slate-800 dark:hover:border-blue-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="break-words font-semibold">
                        {auction.name}
                      </h2>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Created{" "}
                        {auction.createdAt
                          ? new Date(auction.createdAt).toLocaleDateString()
                          : "—"}
                      </p>
                    </div>
                    <StatusBadge status={auction.status} />
                  </div>

                  {auction.description && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {auction.description}
                    </p>
                  )}

                  <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auction ID
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <code className="break-all text-sm font-bold tracking-wide text-blue-700 dark:text-blue-300">
                        {auction.auctionId}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyAuctionId(auction.auctionId)}
                        aria-label={`Copy Auction ID ${auction.auctionId}`}
                        title="Copy Auction ID"
                        className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <FiCopy />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Starting budget
                      </p>
                      <p className="mt-1 font-semibold">
                        ₹
                        {Number(auction.startingBudget).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Team limit
                      </p>
                      <p className="mt-1 font-semibold">
                        {auction.maxTeams} teams
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Minimum bid
                      </p>
                      <p className="mt-1 font-semibold">
                        ₹{Number(auction.minimumBid).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Squad limit
                      </p>
                      <p className="mt-1 font-semibold">
                        {auction.maxPlayersPerTeam} players
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto pt-5">
                    <Link
                      to="/admin/users"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Manage user assignments
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <p className="border-t border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              Showing {filtered.length} of {auctions.length} auctions
            </p>
          </>
        )}
      </section>
    </div>
  );
}
