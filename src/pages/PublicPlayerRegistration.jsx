import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiCalendar,
  FiCheckCircle,
  FiMapPin,
  FiPhone,
  FiUpload,
  FiUser,
} from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white";
const labelClass =
  "mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300";
export default function PublicPlayerRegistration() {
  const { token } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    role: "",
    birthdate: "",
    contactNo: "",
    whatsappNo: "",
    villageTown: "",
  });

  useEffect(() => {
    let alive = true;
    api
      .get(`/player-registration/${encodeURIComponent(token)}`)
      .then(({ data }) => {
        if (alive) setAuction(data.auction);
      })
      .catch((error) => {
        if (alive)
          toast.error(
            error.response?.data?.message ||
              "Registration link is unavailable.",
          );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  function change(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }
  function choosePhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Choose a JPG, PNG, or WebP photo.");
      event.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }
  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) =>
        body.append(key, value.trim()),
      );
      if (photo) body.append("photo", photo);
      const { data } = await api.post(
        `/player-registration/${encodeURIComponent(token)}`,
        body,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      setDone(true);
      toast.success(data.message || "Registration submitted successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to submit registration.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 sm:py-12">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold tracking-wide text-blue-700 dark:text-blue-300"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
              AP
            </span>{" "}
            AUCTIONPRO
          </Link>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-blue-600 dark:text-blue-300">
            Player registration
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
            Join the auction
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Fill in your details to register your interest in participating.
          </p>
        </header>
        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
            Checking registration link…
          </div>
        ) : !auction ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center dark:border-rose-900 dark:bg-slate-900">
            <h2 className="text-xl font-bold">Registration link unavailable</h2>
            <p className="mt-2 text-sm text-slate-500">
              Ask the person who shared this link for a valid link.
            </p>
          </div>
        ) : done ? (
          <div className="rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-sm dark:border-emerald-900 dark:bg-slate-900">
            <FiCheckCircle className="mx-auto text-emerald-500" size={48} />
            <h2 className="mt-4 text-2xl font-bold">Registration submitted!</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Your details have been sent for <strong>{auction.name}</strong>.
              The auction organizer can now review your player profile.
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-8"
          >
            <div className="mb-7 rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Registering for
              </p>
              <h2 className="mt-1 text-lg font-bold">{auction.name}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Auction ID: {auction.auctionId}
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label>
                <span className={labelClass}>First name *</span>
                <span className="relative block">
                  <FiUser className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    name="firstName"
                    value={form.firstName}
                    onChange={change}
                    placeholder="Enter your first name"
                    minLength={1}
                    maxLength={50}
                    autoComplete="given-name"
                    required
                  />
                </span>
              </label>
              <label>
                <span className={labelClass}>Last name *</span>
                <span className="relative block">
                  <FiUser className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    name="lastName"
                    value={form.lastName}
                    onChange={change}
                    placeholder="Enter your last name"
                    minLength={1}
                    maxLength={50}
                    autoComplete="family-name"
                    required
                  />
                </span>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Player role *</span>
                <select
                  className={inputClass}
                  name="role"
                  value={form.role}
                  onChange={change}
                  required
                >
                  <option value="" disabled>
                    Select your playing role
                  </option>
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="All-Rounder">All-Rounder</option>
                  <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>
                <span className="mt-1 block text-xs text-slate-500">
                  Choose the role that best describes your playing style.
                </span>
              </label>
              <label>
                <span className={labelClass}>Birthdate *</span>
                <span className="relative block">
                  <FiCalendar className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="date"
                    name="birthdate"
                    value={form.birthdate}
                    onChange={change}
                    max={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Players must be 15–60 years old.
                </span>
              </label>
              <label>
                <span className={labelClass}>Village / Town *</span>
                <span className="relative block">
                  <FiMapPin className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    name="villageTown"
                    value={form.villageTown}
                    onChange={change}
                    placeholder="Enter your village or town"
                    minLength={2}
                    maxLength={100}
                    required
                  />
                </span>
              </label>
              <label>
                <span className={labelClass}>Contact number *</span>
                <span className="relative block">
                  <FiPhone className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="tel"
                    name="contactNo"
                    value={form.contactNo}
                    onChange={change}
                    placeholder="Enter contact number"
                    minLength={7}
                    maxLength={20}
                    autoComplete="tel"
                    required
                  />
                </span>
              </label>
              <label>
                <span className={labelClass}>WhatsApp number</span>
                <span className="relative block">
                  <FiPhone className="absolute left-3 top-3.5 text-slate-400" />
                  <input
                    className={`${inputClass} pl-10`}
                    type="tel"
                    name="whatsappNo"
                    value={form.whatsappNo}
                    onChange={change}
                    placeholder="Enter WhatsApp number"
                    maxLength={20}
                  />
                </span>
              </label>
              <label className="sm:col-span-2">
                <span className={labelClass}>Player photo (optional)</span>
                <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700 sm:flex-row sm:items-center">
                  <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                    {preview ? (
                      <img
                        src={preview}
                        alt="Photo preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FiUpload className="text-slate-400" size={25} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={choosePhoto}
                      className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:font-semibold file:text-blue-700 dark:file:bg-blue-950 dark:file:text-blue-300"
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      JPG, PNG, or WebP · Max 5 MB
                    </p>
                  </div>
                </div>
              </label>
            </div>
            <p className="mt-5 text-xs leading-5 text-slate-500 dark:text-slate-400">
              By submitting, you confirm these details are accurate and agree
              that the auction organizer may use them to contact you about this
              auction.
            </p>
            <button
              disabled={saving}
              className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "Submitting registration…"
                : "Submit player registration"}
            </button>
          </form>
        )}
        <p className="mt-6 text-center text-xs text-slate-500">
          Powered by AuctionPro · Player registration
        </p>
      </div>
    </main>
  );
}
