import { useCallback, useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiRefreshCw, FiSearch, FiTrash2, FiUpload, FiX } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";
import { useAuth } from "../context/AuthContext";

const blankForm = { name: "", shortName: "", auctionId: "" };

export default function TeamsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const teamBase = isAdmin ? "/admin/teams" : "/user/teams";
  const assignedAuctionId = sessionStorage.getItem("auctionpro_auction_id") || "";
  const [teams, setTeams] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [auctionFilter, setAuctionFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [form, setForm] = useState(blankForm);
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const teamResponse = await api.get(teamBase);
      setTeams(teamResponse.data.teams || []);
      if (isAdmin) {
        const auctionResponse = await api.get("/admin/auctions");
        setAuctions(auctionResponse.data.auctions || []);
      } else {
        setAuctions([]);
        setAuctionFilter(assignedAuctionId);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load teams.");
    } finally {
      setLoading(false);
    }
  }, [teamBase, isAdmin, assignedAuctionId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTeams = useMemo(() => teams.filter((team) => {
    const matchesSearch = `${team.name} ${team.shortName} ${team.auctionId}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (!auctionFilter || team.auctionId === auctionFilter);
  }), [teams, search, auctionFilter]);

  function resetForm() {
    setModalOpen(false);
    setEditingTeam(null);
    setForm(blankForm);
    setLogo(null);
    setPreview("");
  }

  function openCreate() {
    setEditingTeam(null);
    setForm({ ...blankForm, auctionId: isAdmin ? (auctionFilter || auctions[0]?.auctionId || "") : assignedAuctionId });
    setLogo(null);
    setPreview("");
    setModalOpen(true);
  }

  function openEdit(team) {
    setEditingTeam(team);
    setForm({ name: team.name, shortName: team.shortName, auctionId: team.auctionId });
    setLogo(null);
    setPreview(team.logoUrl || "");
    setModalOpen(true);
  }

  function handleLogoChange(event) {
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
    setLogo(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.auctionId) return toast.error("Select an auction.");
    setSaving(true);
    const body = new FormData();
    body.append("name", form.name.trim());
    body.append("shortName", form.shortName.trim().toUpperCase());
    body.append("auctionId", form.auctionId);
    if (logo) body.append("logo", logo);

    try {
      const response = editingTeam
        ? await api.put(`${teamBase}/${editingTeam._id}`, body, { headers: { "Content-Type": "multipart/form-data" } })
        : await api.post(teamBase, body, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(response.data.message || "Team saved.");
      resetForm();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to save team.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(team) {
    if (!window.confirm(`Delete ${team.name}? This cannot be undone.`)) return;
    setDeletingId(team._id);
    try {
      const response = await api.delete(`${teamBase}/${team._id}`);
      setTeams((current) => current.filter((item) => item._id !== team._id));
      toast.success(response.data.message || "Team deleted.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete team.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Squad management"
        title="Teams"
        description="Create and manage auction teams, team short names, and Cloudinary-hosted logos."
        action={<button type="button" onClick={loadData} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><FiRefreshCw /> Refresh</button>}
      />

      <section className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative block">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams..." className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-900" />
        </label>
        {isAdmin ? <select value={auctionFilter} onChange={(e) => setAuctionFilter(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
          <option value="">All auctions</option>
          {auctions.map((auction) => <option key={auction._id} value={auction.auctionId}>{auction.name}</option>)}
        </select> : <div className="flex items-center rounded-xl border border-slate-200 px-3 py-3 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">Assigned auction: {assignedAuctionId}</div>}
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"><FiPlus /> Add team</button>
      </section>

      {loading ? <LoadingState label="Loading teams..." /> : filteredTeams.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <EmptyState title="No teams found" description="Create a team or change your search and auction filters." />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredTeams.map((team) => (
            <article key={team._id} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">
                  {team.logoUrl ? <img src={team.logoUrl} alt={`${team.name} logo`} className="h-full w-full object-contain" /> : <span className="text-xl font-black text-blue-600">{team.shortName}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="break-words font-bold text-slate-900 dark:text-white">{team.name}</h2>
                  <p className="mt-1 inline-flex rounded-lg bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">{team.shortName}</p>
                  <p className="mt-2 break-all text-xs text-slate-500 dark:text-slate-400">{team.auctionId}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button type="button" onClick={() => openEdit(team)} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"><FiEdit2 /> Edit</button>
                <button type="button" disabled={deletingId === team._id} onClick={() => handleDelete(team)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950/40"><FiTrash2 /> {deletingId === team._id ? "Deleting..." : "Delete"}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm" onClick={resetForm}>
          <section role="dialog" aria-modal="true" aria-labelledby="team-form-title" onClick={(e) => e.stopPropagation()} className="my-auto w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-3">
              <div><h2 id="team-form-title" className="text-xl font-bold">{editingTeam ? "Edit team" : "Create team"}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Team logos are securely stored in Cloudinary.</p></div>
              <button type="button" onClick={resetForm} aria-label="Close form" className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div><label htmlFor="team-name" className="mb-1.5 block text-sm font-medium">Team name *</label><input id="team-name" required minLength={2} maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Porbandar Panthers" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="team-short-name" className="mb-1.5 block text-sm font-medium">Short name *</label><input id="team-short-name" required minLength={2} maxLength={10} pattern="[A-Za-z0-9]+" value={form.shortName} onChange={(e) => setForm({ ...form, shortName: e.target.value.toUpperCase() })} placeholder="e.g. PP" className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm uppercase outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950" /></div>
                {isAdmin ? <div><label htmlFor="team-auction" className="mb-1.5 block text-sm font-medium">Auction *</label><select id="team-auction" required disabled={Boolean(editingTeam)} value={form.auctionId} onChange={(e) => setForm({ ...form, auctionId: e.target.value })} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950"><option value="">Select auction</option>{auctions.map((auction) => <option key={auction._id} value={auction.auctionId}>{auction.name}</option>)}</select></div> : <div className="flex items-center rounded-xl bg-slate-50 px-3 py-3 text-sm dark:bg-slate-800">Assigned auction: <strong className="ml-2 break-all">{assignedAuctionId}</strong></div>}
              </div>
              <div>
                <label htmlFor="team-logo" className="mb-2 block text-sm font-medium">Team logo (optional)</label>
                <label htmlFor="team-logo" className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 p-4 hover:border-blue-500 dark:border-slate-700">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">{preview ? <img src={preview} alt="Team logo preview" className="h-full w-full object-contain" /> : <FiUpload size={22} className="text-slate-400" />}</div>
                  <div className="min-w-0"><p className="text-sm font-semibold">Choose logo image</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">JPEG, PNG or WebP · maximum 5 MB</p></div>
                </label>
                <input id="team-logo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="sr-only" />
              </div>
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end"><button type="button" onClick={resetForm} className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold dark:border-slate-700">Cancel</button><button type="submit" disabled={saving || (isAdmin && auctions.length === 0)} className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : editingTeam ? "Save changes" : "Create team"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
