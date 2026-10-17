import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FiCopy,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiLink,
  FiTarget,
  FiX,
} from "react-icons/fi";
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
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
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

  async function createRegistrationLink(auction) {
    try {
      const response = await api.post("/player-registration/links", {
        auctionId: auction.auctionId,
      });
      await navigator.clipboard.writeText(response.data.url);
      toast.success("Player registration link created and copied.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create registration link.",
      );
    }
  }

  async function changeStatus(auction, nextStatus) {
    try {
      const response = await api.patch(`/admin/auctions/${auction.auctionId}`, {
        status: nextStatus,
      });
      setAuctions((current) =>
        current.map((item) =>
          item.auctionId === auction.auctionId ? response.data.auction : item,
        ),
      );
      toast.success("Auction status updated.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update auction status.",
      );
    }
  }

  async function saveAuction(event) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        auctionDate: editing.auctionDate || null,
        startingBudget: Number(editing.startingBudget),
        minimumBid: Number(editing.minimumBid),
        bidIncrement: Number(editing.bidIncrement),
        maxTeams: Number(editing.maxTeams),
        maxPlayersPerTeam: Number(editing.maxPlayersPerTeam),
      };
      const response = await api.patch(
        `/admin/auctions/${editing.auctionId}`,
        payload,
      );
      setAuctions((current) =>
        current.map((item) =>
          item.auctionId === editing.auctionId ? response.data.auction : item,
        ),
      );
      setEditing(null);
      toast.success("Auction settings updated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update auction.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteAuction(auction) {
    if (
      !window.confirm(
        `Delete \"${auction.name}\"? This removes its teams, players, and registration links. Auctions with bid history cannot be deleted.`,
      )
    )
      return;
    try {
      await api.delete(`/admin/auctions/${auction.auctionId}`);
      setAuctions((current) =>
        current.filter((item) => item.auctionId !== auction.auctionId),
      );
      toast.success("Auction deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete auction.");
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

                  <div className="mt-auto space-y-3 pt-5">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Auction status
                      <select
                        value={auction.status}
                        onChange={(event) =>
                          changeStatus(auction, event.target.value)
                        }
                        className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm capitalize text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      >
                        {[
                          "draft",
                          "active",
                          "paused",
                          "completed",
                          "archived",
                        ].map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Link
                      to={`/admin/live-auction/${auction.auctionId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white hover:bg-blue-700"
                    >
                      <FiTarget /> Open live bidding
                    </Link>
                    <button
                      type="button"
                      onClick={() => createRegistrationLink(auction)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                    >
                      <FiLink /> Player registration link
                    </button>
                    <Link
                      to="/admin/users"
                      className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Manage user assignments
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditing({
                            ...auction,
                            auctionDate: auction.auctionDate
                              ? new Date(auction.auctionDate)
                                  .toISOString()
                                  .slice(0, 16)
                              : "",
                          })
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                      >
                        <FiEdit2 /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAuction(auction)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
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

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-auction-title"
        >
          <form
            onSubmit={saveAuction}
            className="my-6 w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 id="edit-auction-title" className="text-xl font-bold">
                  Edit auction
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Auction ID is immutable after creation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Close edit form"
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold sm:col-span-2">
                Auction ID
                <input
                  disabled
                  value={editing.auctionId}
                  className="mt-1.5 w-full cursor-not-allowed rounded-xl border border-slate-300 bg-slate-100 px-3 py-3 font-mono text-sm dark:border-slate-700 dark:bg-slate-800"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Auction name
                <input
                  required
                  minLength={3}
                  maxLength={100}
                  value={editing.name}
                  onChange={(event) =>
                    setEditing({ ...editing, name: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">
                Description
                <textarea
                  rows={3}
                  maxLength={1000}
                  value={editing.description || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, description: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Date
                <input
                  type="datetime-local"
                  value={editing.auctionDate || ""}
                  onChange={(event) =>
                    setEditing({ ...editing, auctionDate: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Starting budget
                <input
                  required
                  type="number"
                  min="1"
                  value={editing.startingBudget}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      startingBudget: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Minimum bid
                <input
                  required
                  type="number"
                  min="1"
                  value={editing.minimumBid}
                  onChange={(event) =>
                    setEditing({ ...editing, minimumBid: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Bid increment
                <input
                  required
                  type="number"
                  min="1"
                  value={editing.bidIncrement}
                  onChange={(event) =>
                    setEditing({ ...editing, bidIncrement: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Maximum teams
                <input
                  required
                  type="number"
                  min="2"
                  max="100"
                  value={editing.maxTeams}
                  onChange={(event) =>
                    setEditing({ ...editing, maxTeams: event.target.value })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="text-sm font-semibold">
                Players per team
                <input
                  required
                  type="number"
                  min="1"
                  max="100"
                  value={editing.maxPlayersPerTeam}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      maxPlayersPerTeam: event.target.value,
                    })
                  }
                  className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                type="submit"
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
