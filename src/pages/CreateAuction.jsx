import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiInfo } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../api/api";
import PageHeader from "../components/PageHeader";

const initialForm = {
  name: "",
  description: "",
  auctionDate: "",
  startingBudget: "10000000",
  minimumBid: "100000",
  bidIncrement: "10000",
  maxTeams: "8",
  maxPlayersPerTeam: "11",
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
  required = false,
  help,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
      />
      {help && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          {help}
        </p>
      )}
    </div>
  );
}

export default function CreateAuction() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const budget = Number(form.startingBudget);
    const minimumBid = Number(form.minimumBid);
    const increment = Number(form.bidIncrement);
    const teams = Number(form.maxTeams);
    const players = Number(form.maxPlayersPerTeam);

    if (minimumBid > budget) {
      toast.error("Minimum bid cannot exceed the starting budget.");
      return;
    }

    if (
      !Number.isInteger(teams) ||
      teams < 2 ||
      !Number.isInteger(players) ||
      players < 1
    ) {
      toast.error("Enter valid whole numbers for teams and players.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        startingBudget: budget,
        minimumBid,
        bidIncrement: increment,
        maxTeams: teams,
        maxPlayersPerTeam: players,
      };

      if (form.auctionDate) {
        payload.auctionDate = new Date(form.auctionDate).toISOString();
      }

      const response = await api.post("/admin/auctions", payload);
      const created = response.data.auction;

      toast.success("Auction created successfully!");
      navigate("/admin/auctions", {
        state: {
          createdAuctionId: created?.auctionId,
          createdAuctionName: created?.name,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to create auction.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link
        to="/admin/auctions"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400"
      >
        <FiArrowLeft /> Back to auctions
      </Link>

      <PageHeader
        eyebrow="Auction management"
        title="Create a new auction"
        description="Set up your cricket auction. AuctionPro will generate a unique Auction ID automatically."
      />

      <form
        onSubmit={handleSubmit}
        className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">Basic information</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Identify this auction and set its scheduled date.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field
                  label="Auction name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. GPL 2027 Premier League"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  maxLength={1000}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the tournament, rules, season, or other important details..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              <Field
                label="Scheduled date and time"
                name="auctionDate"
                type="datetime-local"
                value={form.auctionDate}
                onChange={handleChange}
                placeholder="Select auction date and time"
                help="Optional. Leave blank if not scheduled."
              />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold">Auction settings</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Configure the purse, bidding increments, and squad limits.
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field
                label="Starting budget (₹)"
                name="startingBudget"
                type="number"
                min="1"
                step="1"
                value={form.startingBudget}
                onChange={handleChange}
                placeholder="e.g. 10000000"
                required
                help="Total purse available to each team."
              />
              <Field
                label="Minimum bid (₹)"
                name="minimumBid"
                type="number"
                min="1"
                step="1"
                value={form.minimumBid}
                onChange={handleChange}
                placeholder="e.g. 100000"
                required
              />
              <Field
                label="Bid increment (₹)"
                name="bidIncrement"
                type="number"
                min="1"
                step="1"
                value={form.bidIncrement}
                onChange={handleChange}
                placeholder="e.g. 10000"
                required
              />
              <Field
                label="Maximum teams"
                name="maxTeams"
                type="number"
                min="2"
                max="100"
                step="1"
                value={form.maxTeams}
                onChange={handleChange}
                placeholder="e.g. 8"
                required
              />
              <Field
                label="Maximum players per team"
                name="maxPlayersPerTeam"
                type="number"
                min="1"
                max="100"
                step="1"
                value={form.maxPlayersPerTeam}
                onChange={handleChange}
                placeholder="e.g. 11"
                required
              />
            </div>
          </section>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              to="/admin/auctions"
              className="rounded-xl border border-slate-300 px-5 py-3 text-center text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Creating auction..." : "Create auction"}
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900 dark:bg-blue-950/40">
          <div className="flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-200">
            <FiInfo /> Before you create
          </div>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-blue-900/80 dark:text-blue-100/80">
            <li>• Auction IDs are generated by the backend.</li>
            <li>• The new auction starts in Draft status.</li>
            <li>• Assign user accounts after creating the auction.</li>
            <li>• The starting budget is the purse per team.</li>
          </ul>
        </aside>
      </form>
    </div>
  );
}
