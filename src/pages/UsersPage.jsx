import { useCallback, useEffect, useState } from "react";
import {
  FiLink2,
  FiPlus,
  FiRefreshCw,
  FiUserCheck,
  FiUserX,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiX,
  FiKey,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../api/api";
import PageHeader from "../components/PageHeader";
import { EmptyState, LoadingState } from "../components/Feedback";

const emptyForm = { username: "" };

// Generate an 18-character password using browser cryptographic randomness.
function generateSecurePassword(length = 18) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%&*_-";
  const all = upper + lower + numbers + symbols;

  function secureIndex(max) {
    const buffer = new Uint8Array(1);
    const limit = 256 - (256 % max);

    do {
      window.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);

    return buffer[0] % max;
  }

  const password = [
    upper[secureIndex(upper.length)],
    lower[secureIndex(lower.length)],
    numbers[secureIndex(numbers.length)],
    symbols[secureIndex(symbols.length)],
  ];

  while (password.length < length) {
    password.push(all[secureIndex(all.length)]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedAuction, setSelectedAuction] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyKey, setBusyKey] = useState("");

  // Credentials exist only temporarily in frontend component state.
  const [credentials, setCredentials] = useState(null);
  const [showGeneratedPassword, setShowGeneratedPassword] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);

    try {
      const [userResponse, auctionResponse] = await Promise.all([
        api.get("/admin/users"),
        api.get("/admin/auctions"),
      ]);

      setUsers(userResponse.data.users || []);
      setAuctions(auctionResponse.data.auctions || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to load users or auctions.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleCreateUser(event) {
    event.preventDefault();

    const username = form.username.trim().toLowerCase();

    if (username.length < 3) {
      toast.error("Username must contain at least 3 characters.");
      return;
    }

    if (!window.crypto?.getRandomValues) {
      toast.error("Secure password generation is not supported.");
      return;
    }

    setCreating(true);

    const generatedPassword = generateSecurePassword();

    try {
      const response = await api.post("/admin/users", {
        username,
        password: generatedPassword,
      });

      const createdUser = response.data.user;

      if (!createdUser) {
        // Avoid displaying credentials if the server response is unexpected.
        toast.error(
          "Check the server response before sharing these credentials.",
        );
        await loadData();
        return;
      }

      setUsers((current) => [
        createdUser,
        ...current.filter((user) => user._id !== createdUser._id),
      ]);

      setForm(emptyForm);
      setShowGeneratedPassword(false);
      setCredentials({
        username,
        password: generatedPassword,
      });

      toast.success("User account created successfully.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to create user account.",
      );
    } finally {
      setCreating(false);
    }
  }

  async function copyCredentials() {
    if (!credentials) return;

    try {
      await navigator.clipboard.writeText(
        `Username: ${credentials.username}\nPassword: ${credentials.password}`,
      );

      toast.success("Credentials copied to clipboard.");
    } catch {
      toast.error(
        "Unable to copy automatically. Please copy the credentials manually.",
      );
    }
  }

  async function handleAssignment(user, action) {
    const auctionId = selectedAuction[user._id];

    if (!auctionId) {
      toast.error("Select an auction first.");
      return;
    }

    const key = `${user._id}:${auctionId}`;
    const assigned = user.assignedAuctionIds || [];

    if (action === "assign" && assigned.includes(auctionId)) {
      toast.error("This user is already assigned to that auction.");
      return;
    }

    if (action === "remove" && !assigned.includes(auctionId)) {
      toast.error("This user is not assigned to that auction.");
      return;
    }

    setBusyKey(key);

    try {
      if (action === "assign") {
        await api.post(
          `/admin/auctions/${encodeURIComponent(auctionId)}/assign/${user._id}`,
        );

        toast.success("User assigned to auction.");
      } else {
        await api.delete(
          `/admin/auctions/${encodeURIComponent(auctionId)}/assign/${user._id}`,
        );

        toast.success("User removed from auction.");
      }

      await loadData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to update assignment.",
      );
    } finally {
      setBusyKey("");
    }
  }

  function closeCredentials() {
    setCredentials(null);
    setShowGeneratedPassword(false);
  }

  return (
    <div className="min-w-0">
      <PageHeader
        eyebrow="Access management"
        title="Users"
        description="Create user accounts and control which auctions each user can access."
        action={
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <FiRefreshCw />
            Refresh
          </button>
        }
      />

      {/* Create user */}
      <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FiPlus size={20} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900 dark:text-white">
              Create user account
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              A secure password is generated automatically after you submit the
              form.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="mt-6 grid gap-5 md:grid-cols-2"
        >
          <div>
            <label
              htmlFor="new-username"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Username
            </label>

            <input
              id="new-username"
              name="username"
              type="text"
              autoComplete="off"
              minLength={3}
              maxLength={50}
              required
              value={form.username}
              onChange={handleChange}
              placeholder="e.g. cricketuser01"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiPlus />
              {creating ? "Creating account..." : "Create user"}
            </button>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/40 md:col-span-2">
            <FiKey className="mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />

            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                Automatic password generation
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
                A strong password is generated for each new account. After
                successful creation, a popup lets you view and copy the
                credentials. Assign an auction to grant access.
              </p>
            </div>
          </div>
        </form>
      </section>

      {/* User list and auction assignments */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <FiUsers className="text-blue-600 dark:text-blue-400" size={20} />
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                User accounts and assignments
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Assign an auction or revoke access from a user account.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingState label="Loading users..." />
        ) : users.length === 0 ? (
          <EmptyState
            title="No users yet"
            description="Create a user account using the form above."
          />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {users.map((user) => {
              const assigned = user.assignedAuctionIds || [];
              const availableAuctions = auctions.filter(
                (auction) => !assigned.includes(auction.auctionId),
              );
              const selected = selectedAuction[user._id] || "";
              const assignmentBusy = busyKey === `${user._id}:${selected}`;

              return (
                <article
                  key={user._id}
                  className="p-5 transition hover:bg-slate-50/70 dark:hover:bg-slate-950/40 sm:p-6"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {(user.username || "U").slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <h3 className="break-words font-semibold text-slate-900 dark:text-white">
                          {user.username}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          User account · Created{" "}
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "—"}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {assigned.length === 0 ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                              No auctions assigned
                            </span>
                          ) : (
                            assigned.map((id) => (
                              <span
                                key={id}
                                className="break-all rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              >
                                {id}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="w-full xl:max-w-xl">
                      <label
                        htmlFor={`auction-${user._id}`}
                        className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400"
                      >
                        Choose an auction
                      </label>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <select
                          id={`auction-${user._id}`}
                          value={selected}
                          onChange={(event) =>
                            setSelectedAuction((current) => ({
                              ...current,
                              [user._id]: event.target.value,
                            }))
                          }
                          className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                        >
                          <option value="">Select an auction...</option>
                          {auctions.map((auction) => (
                            <option key={auction._id} value={auction.auctionId}>
                              {auction.name} — {auction.auctionId}
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          disabled={!selected || assignmentBusy}
                          onClick={() => handleAssignment(user, "assign")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiLink2 />
                          {assignmentBusy ? "Saving..." : "Assign"}
                        </button>

                        <button
                          type="button"
                          disabled={!selected || assignmentBusy}
                          onClick={() => handleAssignment(user, "remove")}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                        >
                          {assigned.includes(selected) ? (
                            <FiUserX />
                          ) : (
                            <FiUserCheck />
                          )}
                          Remove
                        </button>
                      </div>

                      {availableAuctions.length === 0 &&
                        auctions.length > 0 && (
                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                            This user is already assigned to every available
                            auction. You can still select an assigned auction to
                            remove access.
                          </p>
                        )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Generated credentials popup */}
      {credentials && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
          onClick={closeCredentials}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="credentials-title"
            className="my-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <FiUserCheck size={23} />
                </div>

                <div>
                  <h2
                    id="credentials-title"
                    className="text-lg font-bold text-slate-900 dark:text-white"
                  >
                    User created successfully
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Save these credentials before closing.
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close credentials popup"
                onClick={closeCredentials}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="generated-username"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Username
                </label>
                <input
                  id="generated-username"
                  readOnly
                  value={credentials.username}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="generated-password"
                  className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  Generated password
                </label>

                <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-slate-50 pr-2 dark:border-slate-700 dark:bg-slate-950">
                  <input
                    id="generated-password"
                    readOnly
                    type={showGeneratedPassword ? "text" : "password"}
                    value={credentials.password}
                    className="min-w-0 flex-1 bg-transparent px-4 py-3 font-mono text-sm text-slate-900 outline-none dark:text-white"
                  />

                  <button
                    type="button"
                    aria-label={
                      showGeneratedPassword ? "Hide password" : "Show password"
                    }
                    title={
                      showGeneratedPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowGeneratedPassword((visible) => !visible)
                    }
                    className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {showGeneratedPassword ? (
                      <FiEyeOff size={19} />
                    ) : (
                      <FiEye size={19} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={copyCredentials}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <FiCopy size={17} />
                Copy credentials
              </button>

              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                Store these credentials securely and share them privately. The
                password will not be available from the user list after you
                close this popup.
              </p>

              <button
                type="button"
                onClick={closeCredentials}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
