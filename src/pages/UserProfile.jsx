import { FiShield, FiUser, FiTag } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

export default function UserProfile() {
  const { user } = useAuth();
  const auctionId = localStorage.getItem("auctionpro_auction_id") || sessionStorage.getItem("auctionpro_auction_id") || "";

  const rows = [
    { label: "Username", value: user?.username || "—", icon: FiUser },
    { label: "Account role", value: user?.role || "user", icon: FiShield },
    {
      label: "Assigned auction ID",
      value: auctionId || "Not available",
      icon: FiTag,
    },
  ];

  return (
    <div className="min-w-0">
      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">
          Account settings
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          My profile
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          Review your AuctionPro account and assigned auction.
        </p>
      </div>

      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="mb-6 flex items-center gap-4 border-b border-slate-200 pb-6 dark:border-slate-800">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            {(user?.username || "U").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h2 className="break-words text-lg font-bold text-slate-900 dark:text-white">
              {user?.username || "Auction user"}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              AuctionPro user account
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {rows.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800"
            >
              <span className="rounded-lg bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Icon size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="mt-1 break-all text-sm font-semibold text-slate-900 dark:text-white">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
          Your access is limited to the auction assigned to your account.
          Contact the administrator if your assignment needs to change.
        </p>
      </section>
    </div>
  );
}
