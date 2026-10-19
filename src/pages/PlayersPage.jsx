import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiTrash2,
  FiUpload,
  FiX,
  FiUser,
  FiShare2,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";

const roles = ["Batsman", "Bowler", "All-Rounder", "Wicket-Keeper"];
const blankForm = {
  name: "",
  role: "Batsman",
  nationality: "India",
  age: "",
  basePrice: "100000",
  auctionId: "",
  teamId: "",
};
const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function PlayersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const playerBase = isAdmin ? "/admin/players" : "/user/players";
  const teamBase = isAdmin ? "/admin/teams" : "/user/teams";
  const assignedAuctionId =
    localStorage.getItem("auctionpro_auction_id") || sessionStorage.getItem("auctionpro_auction_id") || "";
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [auctionFilter, setAuctionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [registrationLink, setRegistrationLink] = useState("");
  const [creatingLink, setCreatingLink] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [playerResponse, teamResponse] = await Promise.all([
        api.get(playerBase),
        api.get(teamBase),
      ]);
      setPlayers(playerResponse.data.players || []);
      setTeams(teamResponse.data.teams || []);
      if (isAdmin) {
        const auctionResponse = await api.get("/admin/auctions");
        setAuctions(auctionResponse.data.auctions || []);
      } else {
        setAuctions([]);
        setAuctionFilter(assignedAuctionId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load players.");
    } finally {
      setLoading(false);
    }
  }, [playerBase, teamBase, isAdmin, assignedAuctionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredPlayers = useMemo(
    () =>
      players.filter((player) => {
        const matchesSearch =
          `${player.name} ${player.nationality} ${player.auctionId}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return (
          matchesSearch &&
          (!auctionFilter || player.auctionId === auctionFilter) &&
          (!roleFilter || player.role === roleFilter) &&
          (!statusFilter || player.status === statusFilter)
        );
      }),
    [players, search, auctionFilter, roleFilter, statusFilter],
  );

  const formTeams = teams.filter((team) => team.auctionId === form.auctionId);

  function resetForm() {
    setModalOpen(false);
    setEditingPlayer(null);
    setForm(blankForm);
    setImageFile(null);
    setPreview("");
  }

  function openCreate() {
    setEditingPlayer(null);
    setForm({
      ...blankForm,
      auctionId: isAdmin
        ? auctionFilter || auctions[0]?.auctionId || ""
        : assignedAuctionId,
    });
    setImageFile(null);
    setPreview("");
    setModalOpen(true);
  }

  function openEdit(player) {
    setEditingPlayer(player);
    setForm({
      name: player.name,
      role: player.role,
      nationality: player.nationality || "India",
      age: player.age ?? "",
      basePrice: String(player.basePrice ?? 0),
      auctionId: player.auctionId,
      teamId: player.teamId?._id || player.teamId || "",
    });
    setImageFile(null);
    setPreview(player.imageUrl || "");
    setModalOpen(true);
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.auctionId) return toast.error("Select an auction.");
    if (
      !Number.isSafeInteger(Number(form.basePrice)) ||
      Number(form.basePrice) < 0
    )
      return toast.error("Base price must be a non-negative whole number.");
    if (
      form.age !== "" &&
      (!Number.isInteger(Number(form.age)) ||
        Number(form.age) < 15 ||
        Number(form.age) > 60)
    )
      return toast.error("Age must be between 15 and 60.");

    setSaving(true);
    const body = new FormData();
    body.append("name", form.name.trim());
    body.append("role", form.role);
    body.append("nationality", form.nationality.trim());
    body.append("age", form.age);
    body.append("basePrice", form.basePrice);
    body.append("auctionId", form.auctionId);
    body.append("teamId", form.teamId);
    if (imageFile) body.append("image", imageFile);

    try {
      const response = editingPlayer
        ? await api.put(`${playerBase}/${editingPlayer._id}`, body, {
            headers: { "Content-Type": "multipart/form-data" },
          })
        : await api.post(playerBase, body, {
            headers: { "Content-Type": "multipart/form-data" },
          });
      toast.success(response.data.message || "Player saved.");
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save player.");
    } finally {
      setSaving(false);
    }
  }

  async function createRegistrationLink() {
    const selectedAuction = isAdmin
      ? auctionFilter || (auctions.length === 1 ? auctions[0].auctionId : "")
      : assignedAuctionId;
    if (!selectedAuction)
      return toast.error(
        "Select one auction from the auction filter before creating a registration link.",
      );
    setCreatingLink(true);
    try {
      const { data } = await api.post("/player-registration/links", {
        auctionId: selectedAuction,
      });
      setRegistrationLink(data.url);
      try {
        await navigator.clipboard.writeText(data.url);
        toast.success("Registration link created and copied to clipboard.");
      } catch {
        toast.success("Registration link created. Copy it from the box below.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create registration link.",
      );
    } finally {
      setCreatingLink(false);
    }
  }

  async function handleDelete(player) {
    if (!window.confirm(`Delete ${player.name}? This cannot be undone.`))
      return;
    setDeletingId(player._id);
    try {
      const response = await api.delete(`${playerBase}/${player._id}`);
      setPlayers((current) =>
        current.filter((item) => item._id !== player._id),
      );
      toast.success(response.data.message || "Player deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete player.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Player management"
        title="Players"
        description="Manage player profiles, base prices, roles, teams, and Cloudinary-hosted photos."
        action={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <FiRefreshCw /> Refresh
          </button>
        }
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_190px_170px_170px_auto]">
        <label className="relative block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {isAdmin ? (
          <select
            value={auctionFilter}
            onChange={(e) => setAuctionFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
          >
            <option value="">All auctions</option>
            {auctions.map((auction) => (
              <option key={auction._id} value={auction.auctionId}>
                {auction.name}
              </option>
            ))}
          </select>
        ) : (
          <div className="flex items-center rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
            Assigned auction: {assignedAuctionId}
          </div>
        )}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All roles</option>
          {roles.map((role) => (
            <option key={role}>{role}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="sold">Sold</option>
          <option value="unsold">Unsold</option>
        </select>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={createRegistrationLink}
            disabled={creatingLink}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-300 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:opacity-60 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
          >
            <FiShare2 />{" "}
            {creatingLink ? "Creating link…" : "Share registration form"}
          </button>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <FiPlus /> Add player
          </button>
        </div>
      </section>

      {registrationLink && (
        <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-blue-900 dark:text-blue-200">
                Public player registration link
              </h2>
              <p className="mt-1 break-all text-sm text-blue-800 dark:text-blue-300">
                {registrationLink}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This link is tied to the selected auction. Share it only with
                players who should register for that auction.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(registrationLink).then(
                    () => toast.success("Link copied."),
                    () => toast.error("Could not copy link."),
                  )
                }
                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
              >
                Copy link
              </button>
              <button
                type="button"
                onClick={() => {
                  const message = `Register for our cricket auction: ${registrationLink}`;
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(message)}`,
                    "_blank",
                    "noopener,noreferrer",
                  );
                }}
                className="rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 dark:border-blue-800 dark:text-blue-300"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => setRegistrationLink("")}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingState label="Loading players..." />
      ) : filteredPlayers.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState
            title="No players found"
            description="Add a player or adjust your search and filters."
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredPlayers.map((player) => (
            <article
              key={player._id}
              className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex gap-4 p-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                  {player.imageUrl ? (
                    <img
                      src={player.imageUrl}
                      alt={player.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FiUser size={30} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words font-bold text-slate-900 dark:text-white">
                    {player.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {player.role} ·{" "}
                    {player.nationality || "Nationality not set"}
                  </p>
                  <p className="mt-2 font-semibold text-blue-700 dark:text-blue-300">
                    {money(player.basePrice)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${player.status === "sold" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" : player.status === "unsold" ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300" : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"}`}
                    >
                      {player.status}
                    </span>
                    {player.teamId && (
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {player.teamId.shortName ||
                          player.teamId.name ||
                          "Assigned"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-100 px-5 py-3 dark:border-slate-800">
                <p className="break-all text-xs text-slate-500 dark:text-slate-400">
                  {player.auctionId}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    disabled={player.status === "sold"}
                    onClick={() => openEdit(player)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <FiEdit2 /> Edit
                  </button>
                  <button
                    type="button"
                    disabled={
                      deletingId === player._id || player.status === "sold"
                    }
                    onClick={() => handleDelete(player)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                  >
                    <FiTrash2 />{" "}
                    {deletingId === player._id ? "Deleting..." : "Delete"}
                  </button>
                </div>
                {player.status === "sold" && (
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Sold players are locked from editing and deletion.
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={resetForm}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-form-title"
            onClick={(e) => e.stopPropagation()}
            className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div>
                <h2 id="player-form-title" className="text-xl font-bold">
                  {editingPlayer ? "Edit player" : "Create player"}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Player photos are securely stored in Cloudinary.
                </p>
              </div>
              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="player-name"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Player name *
                  </label>
                  <input
                    id="player-name"
                    required
                    minLength={2}
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Rohit Sharma"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label
                    htmlFor="player-role"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Role *
                  </label>
                  <select
                    id="player-role"
                    required
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    {roles.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="player-nationality"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Nationality
                  </label>
                  <input
                    id="player-nationality"
                    maxLength={60}
                    value={form.nationality}
                    onChange={(e) =>
                      setForm({ ...form, nationality: e.target.value })
                    }
                    placeholder="e.g. India"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label
                    htmlFor="player-age"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Age
                  </label>
                  <input
                    id="player-age"
                    type="number"
                    min={15}
                    max={60}
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="e.g. 24"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label
                    htmlFor="player-price"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Base price (₹) *
                  </label>
                  <input
                    id="player-price"
                    required
                    type="number"
                    min={0}
                    step={1}
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({ ...form, basePrice: e.target.value })
                    }
                    placeholder="e.g. 100000"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                {isAdmin ? (
                  <div>
                    <label
                      htmlFor="player-auction"
                      className="mb-1.5 block text-sm font-medium"
                    >
                      Auction *
                    </label>
                    <select
                      id="player-auction"
                      required
                      disabled={Boolean(editingPlayer)}
                      value={form.auctionId}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          auctionId: e.target.value,
                          teamId: "",
                        })
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <option value="">Select auction</option>
                      {auctions.map((auction) => (
                        <option key={auction._id} value={auction.auctionId}>
                          {auction.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center rounded-xl bg-slate-50 px-3 py-3 text-sm dark:bg-slate-800">
                    Assigned auction:{" "}
                    <strong className="ml-2 break-all">
                      {assignedAuctionId}
                    </strong>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="player-team"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Team (optional)
                  </label>
                  <select
                    id="player-team"
                    value={form.teamId}
                    onChange={(e) =>
                      setForm({ ...form, teamId: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">No team assigned</option>
                    {formTeams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.name} ({team.shortName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="player-image"
                  className="mb-2 block text-sm font-medium"
                >
                  Player photo (optional)
                </label>
                <label
                  htmlFor="player-image"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 hover:border-blue-500 dark:border-slate-700"
                >
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Player preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUpload size={22} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Choose player photo</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      JPEG, PNG or WebP · maximum 5 MB
                    </p>
                  </div>
                </label>
                <input
                  id="player-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || (isAdmin && auctions.length === 0)}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingPlayer
                      ? "Save changes"
                      : "Create player"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
