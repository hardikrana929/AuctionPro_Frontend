import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FiArrowUpRight, FiUsers, FiActivity, FiPlus } from "react-icons/fi";

import { MdEmojiEvents } from "react-icons/md";

import api from "../api/api";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";

function StatCard({ title, value, description, icon: Icon, iconClass }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-bold tracking-tight">{value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const [auctions, setAuctions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        const [auctionResponse, userResponse] = await Promise.all([
          api.get("/admin/auctions"),
          api.get("/admin/users"),
        ]);

        if (!active) return;

        setAuctions(auctionResponse.data.auctions || []);
        setUsers(userResponse.data.users || []);
      } catch (err) {
        if (active) {
          setError(
            err.response?.data?.message ||
              "Unable to load dashboard data. Check the backend connection.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const activeAuctions = auctions.filter((auction) =>
    ["active", "paused"].includes(auction.status),
  ).length;

  return (
    <div>
      <PageHeader
        eyebrow="Dashboard"
        title="Good to see you, Admin"
        description="Here is the current overview of your AuctionPro workspace."
        action={
          <Link
            to="/admin/auctions/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700"
          >
            <FiPlus /> Create auction
          </Link>
        }
      />

      {loading ? (
        <LoadingState label="Loading dashboard..." />
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
          <p className="mt-2 text-xs">
            Confirm that the backend is running at your configured API URL and
            that you are signed in as Admin.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total auctions"
              value={auctions.length}
              description="Auctions created in the system"
              icon={MdEmojiEvents}
              iconClass="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            />
            <StatCard
              title="User accounts"
              value={users.length}
              description="Registered auction users"
              icon={FiUsers}
              iconClass="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
            />
            <StatCard
              title="In progress"
              value={activeAuctions}
              description="Active or paused auctions"
              icon={FiActivity}
              iconClass="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            />
            <StatCard
              title="Draft auctions"
              value={auctions.filter((item) => item.status === "draft").length}
              description="Auctions not yet started"
              icon={FiArrowUpRight}
              iconClass="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            />
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
              <div>
                <h2 className="font-semibold">Recent auctions</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  The latest auctions created by your Admin account.
                </p>
              </div>
              <Link
                to="/admin/auctions"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View all auctions →
              </Link>
            </div>

            {auctions.length === 0 ? (
              <EmptyState
                title="No auctions yet"
                description="Create your first auction to start organizing teams and players."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Auction</th>
                      <th className="px-5 py-4 font-semibold">Auction ID</th>
                      <th className="px-5 py-4 font-semibold">Budget</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {auctions.slice(0, 5).map((auction) => (
                      <tr key={auction._id}>
                        <td className="px-5 py-4 font-medium">
                          {auction.name}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {auction.auctionId}
                        </td>
                        <td className="px-5 py-4">
                          ₹
                          {Number(auction.startingBudget).toLocaleString(
                            "en-IN",
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold capitalize dark:bg-slate-800">
                            {auction.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
